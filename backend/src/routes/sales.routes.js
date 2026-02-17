const express=require('express');
const router=express.Router();
const Sale=require('../models/Sale');
const Product=require('../models/Product');
const Client=require('../models/Client');

router.post('/', async(req,res)=>{
    try{
        const {items, clienteId, fiado, pago}=req.body;
        let total=0;

        for (const item of items){
            const product=await Product.findById(item.producto);

            if(product.tipoVenta==='unidad'){
                if(product.stock<item.cantidad){
                    return res.status(400).json({error:'Stock insuficiente'});
                }
                product.stock-=item.cantidad;
                item.precio=product.precioUnitario;
            }
            if(product.tipoVenta==='peso'){
                if(product.stockKg<item.cantidad){
                    return res.status(400).json({error:'Stock insuficiente(kg)'});
                }
                product.stockKg-=item.cantidad;
                item.precio=product.precioKg;
            }
            item.subtotal=item.cantidad*item.precio;
            total+=item.subtotal;

            await product.save();
        }
        const sale=new Sale({
            cliente: clienteId || null,
            items,
            total,
            fiado,
            estado: fiado?'pendiente':'pagada',
            pago
        });
        await sale.save();

        if(fiado && clienteId){
            await Cliente.findByIdAndUpdate(clienteId,{
                $inc:{saldoFiado:total}
            });
        }
        res.status(201).json(sale);
    }catch(error){
        res.status(400).json({error: error.message});
    }
});

router.get('/daily-summary',async(req,res)=>{
    const inicio=new Date();
    inicio.setHours(0,0,0,0);

    const fin=new Date();
    fin.setHours(23,59,59,999);

    const ventas=await Sale.Find({
        createdAt:{$gte:inicio, $lte:fin}
    });
    let total=0;
    let fiado=0;

    ventas.forEach(v=>{
        total+=v.total;
        if(v.fiado)fiado+=v.total;
    });
    res.json({
        fecha: inicio.toLocaleDateString(),
        ventas: ventas.length,
        totalVendido: total,
        totalFiado: fiado,
        totalCobrado: total - fiado
    });
});

router.get('/by-date/:fecha',async(req,res)=>{
    const fecha=new Date(req.params.fecha);

    const inicio=new Date(fecha);
    inicio.setHours(0,0,0,0);

    const fin=new Date(fecha);
    fin.setHours(23,59,59,999);
    
    const ventas=await Sale.find({
        createdAt:{$gte:inicio ,$lte: fin}
    }).populate('cliente');

    res.json(ventas);
});

module.exports=router;