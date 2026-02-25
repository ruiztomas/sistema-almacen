const express=require('express');
const router=express.Router();
const Product=require('../models/Product');

router.post('/', async(req,res,next)=>{
    try{
        const product=new Product(req.body);
        await product.save();
        res.status(201).json(product);
    }catch(error){
        next(error);
    }
});

router.get('/', async(req, res)=>{
    const products=await Product.find({activo: true}).sort({nombre:1});
    res.json(products);
});

router.get('/alerts/low-stock',async(req,res)=>{
    const products=await Product.find({
        activo: true,
        $or:[
            {tipoVenta:'unidad', $expr:{$lte:['$stock', '$stockMinimo']}},
            {tipoVenta:'peso', $expr:{$lte:['$stockKg','$stockMinimo']}}
        ]
    });
    res.json(products);
});

router.put('/:id', async(req, res)=>{
    const product=await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new: true}
    );
    res.json(product);
});

router.delete('/:id', async(req, res)=>{
    await Product.findByIdAndUpdate(req.params.id, {activo: false});
    res.json({message: 'Producto desactivado'});
});

module.exports=router;