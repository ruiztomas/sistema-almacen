const express=require('express');
const router=express.Router();
const Product=require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');

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

router.get('/inventory-value',async(req,res)=>{
    const products=await Product.find({activo:true});
    let total=0;
    products.forEach(p=>{
        if(p.tipoVenta==='unidad'){
            total+=p.stock*p.precioCosto;
        }
        if(p.tipoVenta==='peso'){
            total+=p.stockKg*p.precioCosto;
        }
    });
    res.json({
        dineroInvertido:total
    });
});

router.get('/category/:cat',async(req,res)=>{
    const products=await Product.find({
        categoria:req.params.cat,
        activo:true
    });
    res.json(products);
});

router.post('/:id/restock',async(req,res)=>{
    const {cantidad}=req.body;
    const product=await Product.findById(req.params.id);
    if(product.tipoVenta==='unidad'){
        product.stock+=cantidad;
    }
    if(product.tipoVenta==="peso"){
        product.stockKg+=cantidad;
    }
    await product.save();

    await Movement.create({
        producto: product._id,
        tipo:"entrada",
        cantidad,
        precioCosto: product.precioCosto
    });
    res.json(product);
});

router.get('/restock-alerts', async(req,res)=>{
    const products=await Product.find({activo:true});
    const faltantes=[];
    products.forEach(p=>{
        if(p.tipoVenta==="unidad"){
            if(p.stock<=p.stockMinimo){
                faltantes.push(p);
            }
        }
        if(p.tipoVenta==="peso"){
            if(p.stockKg<=p.stockMinimo){
                faltantes.push(p);
            }
        }
    });
    res.json(faltantes);
});

router.get('/restock-plan',async(req,res)=>{
    const products=await Product.find({activo:true});
    const reposicion=[];
    let dineroNecesario=0;
    products.forEach(p=>{
        let stockActual=p.tipoVenta==="unidad" ? p.stock : p.stockKg;
        if(stockActual<=p.stockMinimo){
            const cantidadComprar=(p.stockMinimo*2)-stockActual;
            const costo=cantidadComprar*p.precioCosto;
            dineroNecesario+=costo;
            reposicion.push({
                producto:p.nombre,
                comprar:cantidadComprar,
                costo
            });
        }
    });
    res.json({
        productos: reposicion,
        dineroNecesario
    });
});

module.exports=router;