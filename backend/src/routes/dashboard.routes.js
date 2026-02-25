const express=require('express');
const router=express.Router();
const Expense=require('../models/Expense');
const {auth}=require('../middleware/auth.middleware');

router.get('/',auth,async(req,res, next)=>{
    try{
        let match={};
        if(req.user.role !== 'admin'){
            match.user=req.user.id;
        }
        //Total general
        const totalResult=await Expense.aggregate([
            { $match: match},
            {
                $group:{
                    _id: null,
                    total: { $sum: "$monto"}
                }
            }
        ]);
        //Total por categoria
        const categoryResult=await Expense.aggregate([
            { $match: match},
            {
                $group:{
                    _id: "$categoria",
                    total: { $sum: "$monto"}
                }
            },
            { $sort: {total: -1}}
        ]);
        //Ultimos 5 gastos
        const latestExpenses=await Expense.find(match)
            .sort({fecha: -1})
            .limit(5);
        
        res.json({
            total: totalResult[0]?.total || 0,
            byCategory: categoryResult,
            latest: latestExpenses
        });
    }catch(error){
        next(error);
    }
});

module.exports=router;