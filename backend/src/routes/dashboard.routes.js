const express=require('express');
const router=express.Router();

const Expense=require('../models/Expense');
const Product=require("../models/Product");
const Sale=require('../models/Sale');

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
        
        //Ventas del dia
        const ventasHoy=await Sale.find({
            createdAt:{$gte:inicio, $lte:fin}
        });
        let totalVentas=0;
        let costoProducto=0;
        
        ventasHoy.forEach(v=>{
            totalVentas+=v.total;

            v.items.forEach(item=>{
                costoProducto+=item.cantidad*(item.precioCosto || 0);
            });
        });
        const gananciaHoy=totalVentas-costoProductos;

        //Inventario
        const products=await Product.fin({activo:true});

        let valorInventario=0;
        let productosStockBajo=0;
        let dineroReposicion=0;

        products.forEach(p=>{
            const stockActual=p.tipoVenta==="unidad" ? p.stock : p.stockKg;
            valorInventario+=stockActual*(p.precioCosto || 0);
            if(stockActual<=p.stockMinimo){
                productosStockBajo++;
                const cantidadComprar=(p.stockMinimo*2)-stockActual;
                dineroReposicion+=cantidadComprar*(p.precioCosto || 0);
            }
        });

        //Productos mas vendidos
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
            gastosTotales:totalResult[0]?.total || 0,
            gastosPorCategoria: categoryResult,
            ultimosGastos: latestExpenses,
            ventasHoy: totalVentas,
            gananciaHoy,
            valorInventario,
            productosStockBajo,
            dineroReposicion,
            topProductos: ranking
        });
    }catch(error){
        next(error);
    }
});

module.exports=router;