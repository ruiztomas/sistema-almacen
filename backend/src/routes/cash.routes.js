const express=require("express");
const CashRegister = require("../models/CashRegister");
const router=express.Router();

//abrir caja
router.post("/open", async(req,res)=>{
    const {montoInicial}=req.body;

    const caja=new CashRegister({
        montoInicial
    });
    await caja.save();
    res.json(caja);
});

//estado de caja
router.get("/status", async(req,res)=>{
    const caja=await CashRegister.findOne({abierta:true});
    res.json(caja);
});

//cerrar caja
router.post("/close",async(req,res)=>{
    const {montoFinal}=req.body;

    const caja=await CashRegister.findOne({abierta:true});

    if(!caja)return res.status(400).json({error:"No hay caja abierta"});

    caja.montoFinal=montoFinal;
    caja.abierta=false;
    caja.closedAt=new Date();

    caja.diferencia=montoFinal - (caja.montoInicial + caja.ventasEfectivo - caja.gastos);
    await caja.save();
    res.json(caja);
});

module.exports=router;