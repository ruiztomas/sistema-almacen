const express=require('express');
const router=express.Router();
const Expense=require('../models/Expense');
const {body, validationResult}=require('express-validator');
const {auth, onlyAdmin}=require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

//POST /api/expenses  *Solo ADMIN puede crear gastos*
router.post(
    '/', 
    auth,
    upload.single('comprobante'),
    [
        body('description').notEmpty().withMessage('La descripcion es obligatoria'),
        body('categoria').notEmpty().withMessage('La categoria es obligatoria'),
        body('monto').isNumeric().withMessage('El monto debe ser un numero'),
    ],
    async(req,res, next)=>{
    try{ 
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({error: errors.array()});
        }
        const expense=new Expense({
            ...req.body,
            user:req.user.id,
            comprobante:req.file?req.file.filename:null
        });
        await expense.save();
        res.status(201).json(expense);
    }catch(error){
        next(error);
    }
});

//GET /api/expenses *Cualquier usuario autenticado puede ver gastos*
router.get('/', auth, async(req,res, next)=>{
    try{
        const {page=1, limit=5, categoria, desde, hasta}=req.query;
        let filter={};
        //Filtro por rol
        if(req.user.role!=="admin"){
            filter.user=req.user.id;
        }
        //Filtro por categoria
        if(categoria){
            filter.categoria=categoria;
        }
        //Filtro por fechas
        if(desde || hasta){
            filter.fecha={};
            if(desde)filter.fecha.$gte=new Date(desde);
            if(hasta)filter.fecha.$lte=new Date(hasta);
        }
        const expenses=await Expense.find(filter)
            .sort({fecha:-1})
            .skip((page-1)*limit)
            .limit(Number(limit));

        const total=await Expense.countDocuments(filter);
        res.json({
            page: Number(page),
            totalPages:Math.ceil(total/limit),
            totalRecords: total,
            data: expenses
        });
    }catch(error){
        next(error);
    }
});

//PUT /api/expenses/:id *Actualizar datos de gastos*
router.put('/:id',auth, async(req,res,next)=>{
    try{
        const expense=await Expense.findById(req.params.id);

        if(!expense){
            return res.stataus(404).json({error:"Gasto no encontrado"});
        }
        //Si no es admin y no es el dueño
        if(req.user.role!=='admin' && expense.user.toString() !== req.user.id){
            return res.status(403).json({error: "No autorizado"});
        }
        const updatedExpense=await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            {returnDocument:'after'}
        );
        res.json(updatedExpense);
    }catch(error){
        next(error);
    }
});

//DELETE /api/expenses/:id *Eliminar gasto*
router.delete('/:id',auth,async(req,res,next)=>{
    try{
        const expense=await Expense.findById(req.params.id);

        if(!expense){
            return res.status(404).json({error:'Gasto no encontrado'});
        }
        //Si no es admin y no es el dueño
        if(req.user.role !=='admin' && expense.user.toString() !== req.user.id){
            return res.status(403).json({error:'No autorizado'});
        }
        await Expense.findByIdAndDelete(req.params.id);
        res.json({message:"Gasto eliminado correctamente"});
    }catch(error){
        next(error);
    }
});

//GET /api/expenses/stats/total *Total de gastos*
router.get('/stats/total',auth,async(req,res,next)=>{
    try{
        let match={};
        //Si no es admin, solo sus gastos
        if(req.user.role !=='admin'){
            match.user=req.user.id;
        }
        const result=await Expense.aggregate([
            {$match:match},
            {
                $group:{
                    _id:null,
                    total:{$sum:"$monto"}
                }
            }
        ]);
        res.json({
            total:result[0]?.total || 0
        });
    }catch(error){
        next(error);
    }
});

//GET /api/expenses/stats/bycategory  *Total de gastos por categoria*
router.get('/stats/by-category',auth,async(req,res,next)=>{
    try{
        let match={};
        if(req.user.role !=='admin'){
            match.user=req.user.id;
        }
        const result=await Expense.aggregate([
            { $match: match },
            {
                $group: {
                    _id: "$categoria",
                    total: {$sum:"$monto"}
                }
            },
            {$sort:{total:-1}}
        ]);
        res.json(result);
    }catch(error){
        next(error);
    }
})

module.exports=router;