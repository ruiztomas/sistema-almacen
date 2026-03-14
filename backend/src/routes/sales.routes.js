const express=require('express');
const router=express.Router();
const Sale=require('../models/Sale');
const Product=require('../models/Product');
const Client=require('../models/Client');
const Expense=require('../models/Expense');
const Movement=require('../models/InventoryMovement');

router.post('/', async(req,res,next)=>{
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
                await Movement.create({
                    producto: product._id,
                    tipo:"venta",
                    cantidad:item.cantidad,
                    precioCosto:product.precioCosto
                });
            }
            if(product.tipoVenta==='peso'){
                if(product.stockKg<item.cantidad){
                    return res.status(400).json({error:'Stock insuficiente(kg)'});
                }
                product.stockKg-=item.cantidad;
                await Movement.create({
                    producto: product._id,
                    tipo:"venta",
                    cantidad:item.cantidad,
                    precioCosto: product.precioCosto
                });
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
            await Client.findByIdAndUpdate(clienteId,{
                $inc:{saldoFiado:total}
            });
        }
        res.status(201).json(sale);
    }catch(error){
        next(error);
    }
});

router.get('/daily-summary',async(req,res)=>{
    const inicio=new Date();
    inicio.setHours(0,0,0,0);

    const fin=new Date();
    fin.setHours(23,59,59,999);

    const ventas=await Sale.find({
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

router.get('/monthly-summary/:year/:month', async(req,res)=>{
    const {year, month}=req.params;

    const inicio=new Date(year, month -1, 1);
    const fin=new Date(year, month, 0, 23, 59, 59);

    const ventas=await Sale.find({
        createdAt:{$gte: inicio, $lte: fin}
    });

    const gastos=await Expense.find({
        fecha:{$gte: inicio, $lte: fin}
    });

    let totalVentas=0;
    let totalFiado=0;
    let totalGastos=0;

    ventas.forEach(v=>{
        totalVentas+=v.total;
        if(v.fiado)totalFiado+=v.total;
    });

    gastos.forEach(g=>{
        totalGastos+=g.monto;
    });

    res.json({
        mes: `${month}/${year}`,
        totalVentas,
        totalFiado,
        totalCobrado:totalVentas-totalFiado,
        totalGastos,
        gananciaEstimada:totalVentas-totalGastos
    });
});

router.get('/sales/hourly-summary', async (req, res) => {

    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    const ventas = await Sale.aggregate([
        {
            $match: {
                createdAt: { $gte: hoy }
            }
        },
        {
            $group: {
                _id: { $hour: "$createdAt" },
                total: { $sum: "$total" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.json(ventas);
});

router.get('/real-profit/today', async(req,res)=>{
    const inicio=new Date();
    inicio.setHours(0,0,0,0);

    const ventas=await Sale.find({
        createdAt:{$gte: inicio}
    });
    let ingreso=0;
    let costo=0;

    ventas.forEach(v=>{
        ingreso+=v.total;

        v.items.forEach(item=>{
            costo+=item.cantidad*item.precioCosto;
        });
    });
    res.json({
        ingreso,
        costo,
        gananciaReal: ingreso-costo
    });
});

router.get('/dashboard', async(req,res)=>{
    const Product=require('../models/Product');
    const Sale=require('../models/Sale');

    const inicio=new Date();
    inicio.setHours(0,0,0,0);

    const ventasHoy=await Sale.find({
        createdAt:{$gte: inicio}
    });
    const products=await Product.find({activo:true});

    let totalVentas=0;
    let costoProductos=0;

    ventasHoy.forEach(v=>{
        totalVentas+=v.total;

        v.items.forEach(item=>{
            costoProductos+=item.cantidad*(item.precioCosto || 0);
        });
    });
    const ganancia=totalVentas-costoProductos;

    let valorInventario=0;
    let productosStockBajo=0;
    let dineroReposicion=0;

    products.forEach(p=>{
        const stockActual=p.tipoVenta==="unidad"?p.stock:p.stockKg;
        valorInventario+=stockActual*(p.precioCosto || 0);
        if(stockActual<=p.stockMinimo){
            productosStockBajo++;
            const cantidadComprar=(p.stockMinimo*2)-stockActual;
            dineroReposicion+=cantidadComprar*(p.precioCosto || 0);
        }
    });
    const topProductos={};
    ventasHoy.forEach(v=>{
        v.items.forEach(item=>{
            if(!topProductos[item.producto]){
                topProductos[item.producto]=0;
            }
            topProductos[item.producto]+=item.cantidad;
        });
    });
    const ranking=Object.entries(topProductos)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,5);
    res.json({
        ventasHoy:totalVentas,
        gananciaHoy:ganancia,
        valorInventario,
        productosStockBajo,
        dineroReposicion,
        topProductos:ranking
    });
});

module.exports=router;