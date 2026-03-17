const express=require("express");
const CashRegister = require("../models/CashRegister");
const { auth }=require("../middleware/auth.middleware");
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
router.post("/close", auth, async (req, res) => {
  try{
    const { montoFinal }=req.body;
    const caja=await CashRegister.findOne({ abierta: true });
    if (!caja){
      return res.status(400).json({ message: "No hay caja abierta" });
    }
    // 💰 CALCULOS
    const montoEsperado =
      caja.montoInicial +
      caja.ventasEfectivo -
      caja.gastos;
    const diferencia = montoFinal - montoEsperado;
    caja.montoFinal = montoFinal;
    caja.montoEsperado = montoEsperado;
    caja.diferencia = diferencia;
    caja.cerrada = true;
    caja.abierta = false;
    await caja.save();
    res.json({
      message: "Caja cerrada",
      montoEsperado,
      diferencia
    });
  }catch(error){
    console.log(error);
    res.status(500).json({ error: "Error al cerrar caja" });
  }
});
module.exports=router;