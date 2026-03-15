const express=require('express');
const router=express.Router();

const Product=require('../models/Product');
const Movement=require('../models/InventoryMovement');

//Ver todos los movimientos
router.get('/movements',async(req,res)=>{
    const movements=await Movement.find()
        .populate('producto')
        .sort({createdAt:-1})
        .limit(100);
    res.json(movements);
});

//Historial de producto
router.get('/movements/:productId', async(req,res)=>{
    const movements=await Movement.find({
        producto:req.params.productId
    })
    .populate('producto')
    .sort({createdAt:-1});

    res.json(movements);
});

//Reposicion de stock
router.post('/restock',async(req,res)=>{
    const {productId, cantidad, precioCosto}=req.body;
    const product=await Product.findById(productId);
    if(!product){
        return res.status(404).json({error: "Producto no encontrado"});
    }
    if(product.tipoVenta==="unidad"){
        product.stock+=cantidad;
    }
    if(product.tipoVenta==="peso"){
        product.stockKg+=cantidad;
    }
    if(precioCosto){
        product.precioCosto=precioCosto;
    }
    await product.save();
    await Movement.create({
        producto: product._id,
        tipo: "reposicion",
        cantidad,
        precioCosto: product.precioCosto
    });
    res.json({
        message:"Stock actualizado",
        product
    });
});

//Ajuste manual de stock
router.post('/adjust', async(req,res)=>{
    const {productId, cantidad, motivo}=req.body;
    const product=await Product.findById(productId);
    if(!product){
        return res.status(404).json({error:"Producto no encontrado"});
    }
    if(product.tipoVenta==="unidad"){
        product.stock+=cantidad;
    }
    if(product.tipoVenta==="peso"){
        product.stockKg+=cantidad;
    }
    await product.save();
    await Movement.create({
        producto: product._id,
        tipo: "ajuste",
        cantidad,
        motivo
    });
    res.json({
        message: "Ajuste realizado",
        product
    });
});
module.exports=router;