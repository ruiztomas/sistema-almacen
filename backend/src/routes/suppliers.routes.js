const express=require("express");
const router=express.Router();

const Supplier=require("../models/Supplier");

//crear proveedor
router.post("/",async(req,res)=>{
    const supplier=new Supplier(req.body);
    await supplier.save();
    res.json(supplier);
});

//lista proveedores
router.get("/",async (req,res)=>{
    const suppliers=await Supplier.find();
    res.json(suppliers);
});

//eliminar proveedor
router.delete("/:id", async(req,res)=>{
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({message:"Proveedor eliminado"});
});
module.exports=router;