const express=require('express');
const router=express.Router();
const Expense=require('../models/Expense');
const {auth, onlyAdmin}=require('../middleware/auth.middleware');

//POST /api/expenses  *Solo ADMIN puede crear gastos*
router.post('/', auth, onlyAdmin, async(req,res)=>{
    try{ 
        const expense=new Expense(req.body);
        await expense.save();
        res.status(201).json(expense);
    }catch(error){
        res.status(500).json({message: 'Error al crear gasto', error: error.message});
    }
});

//GET /api/expenses *Cualquier usuario autenticado puede ver gastos*
router.get('/',auth, async(req,res)=>{
    try{
        const expenses=await Expense.find().sort({fecha: -1});
        res.json(expenses);
    }catch(error){
        res.status(500).json({message: 'Error al obtener gastos', error:error.message});
    }
});

module.exports=router;