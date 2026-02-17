const express=require('express');
const router=express.Router();
const Expense=require('../models/Expense');

router.post('/',async(req,res)=>{
    const expense=new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
});

router.get('/',async(req,res)=>{
    const expenses=await Expense.find().sort({fecha: -1});
    res.json(expenses);
});

module.exports=router;