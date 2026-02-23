const express=require('express');
const router=express.Router();
const Expense=require('../models/Expense');
const {auth, onlyAdmin}=require('../middleware/auth.middleware');

//POST /api/expenses  *Solo ADMIN puede crear gastos*
router.post('/', auth, async(req,res)=>{
    try{ 
        const expense=new Expense({
            ...req.body,
            user:req.user.id
        });
        await expense.save();
        res.status(201).json(expense);
    }catch(error){
        res.status(500).json({message: 'Error al crear gasto', error: error.message});
    }
});

//GET /api/expenses *Cualquier usuario autenticado puede ver gastos*
router.get('/', auth, async(req,res)=>{
    try{
        let expenses;
        if(req.user.role==="admin"){
            expenses=await Expense.find().sort({fecha: -1});
        }else{
            expenses=await Expense.findOne({user: req.user.id}).sort({fecha:-1});
        }
        res.json(expenses);
    }catch(error){
        res.status(500).json({message: 'Error al obtener gastos', error:error.message});
    }
});

//PUT /api/expenses/:id *Actualizar datos de gastos*
router.put('/:id',auth, async(req,res)=>{
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
        res.status(500).json({message:"Erro al actualizar gasto"});
    }
});

//DELETE /api/expenses/:id *Eliminar gasto*
router.delete('/:id',auth,async(req,res)=>{
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
        res.status(500).json({message:"Error al eliminar gasto"});
    }
});

//GET /api/expenses/stats/total *Total de gastos*
router.get('/stats/total',auth,async(req,res)=>{
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
        res.status(500).json({message:'Error al calcular total'});
    }
});

//GET /api/expenses/stats/bycategory  *Total de gastos por categoria*
router.get('/stats/by-category',auth,async(req,res)=>{
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
        res.status(500).json({message:"Error al calcular estadisticas"})
    }
})

module.exports=router;