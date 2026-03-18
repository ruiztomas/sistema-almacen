const express=require("express");
const router=express.Router();
const pool=require("../config/postgres");

//Ver todos los movimientos
router.get("/movements",async(req,res)=>{
    const result=await pool.query(`
        SELECT im.*, p.nombre
        FROM inventory_movements im
        JOIN products p ON p.id=im.producto_id
        ORDER BY im.created_at DESC
        LIMIT 100
    `);
    res.json(result.rows);
});

//Movimientos de un producto
router.get("/movements/:productId",async(req,res)=>{
    const result=await pool.query(`
        SELECT im.*, p.nombre
        FROM inventory_movements im
        JOIN products p ON p.id=im.producto_id
        WHERE im.producto_id=$1
        ORDER BY im.created_at DESC
    `,[req.params.productId]);
    res.json(result.rows);
});

//Reposicion de stock
router.post("/restock",async (req,res)=>{
    try{
        const { productId, cantidad, precioCosto }=req.body;
        const productRes=await pool.query(
            "SELECT * FROM products WHERE id=$1",
            [productId]
        );
        const product=productRes.rows[0];
        if(!product){
            return res.status(404).json({error:"Producto no encontrado"});
        }
        let newStock=product.stock;
        let newStockKg=product.stock_kg;
        let newPrecioCosto=product.precio_costo;
        //Actualizar stock
        if(product.tipo_venta==="unidad"){
            newStock+=cantidad;
        }else{
            newStockKg+=cantidad;
        }
        //Actualizar precio costo si viene
        if(precioCosto){
            newPrecioCosto=precioCosto;
        }
        //Update producto
        const updated=await pool.query(
            `UPDATE products
            SET stock=$1, stock_kg=$2, precio_costo=$3
            WHERE id=$4
            RETURNING *`,
            [newStock, newStockKg, newPrecioCosto, productId]
        );
        //Guardar movimiento
        await pool.query(
            `INSERT INTO inventory_movements
            (producto_id, tipo, cantidad, precio_costo)
            VALUES($1, 'entrada', $2, $3)`,
            [productId, cantidad, newPrecioCosto]
        );
        res.json({
            message:"Stock actualizado",
            product: updated.rows[0]
        });
    }catch(error){
        res.status(500).json({error:error.message});
    }
});

//AJUSTE MANUAL
router.post("/adjust", async(req,res)=>{
    try{
        const { productId, cantidad, motivo }=req.body;
        const productRes=await pool.query(
            "SELECT * FROM products WHERE id=$1",
            [productId]
        );
        const product=productRes.rows[0];
        if(!product){
            return res.status(404).json({error:"Producto no encontrado"});
        }
        let newStock=product.stock;
        let newStockKg=product.stock_kg;
        if(product.tipo_venta==="unidad"){
            newStock+=cantidad;
        }else{
            newStockKg+=cantidad;
        }
        const updated=await pool.query(
            `UPDATE products
            SET stock=$1, stock_kg=$2
            WHERE id=$3
            RETURNING *`,
            [newStock, newStockKg, productId]
        );
        await pool.query(
            `INSERT INTO inventory_movements
            (producto_id, tipo, cantidad, nota)
            VALUES($1, 'ajuste', $2, $3)`,
            [productId, cantidad, motivo]
        );
        res.json({
            message: "Ajuste realizado",
            product:updated.rows[0]
        });
    }catch(error){
        res.status(500).json({error: error.message});
    }
});
module.exports=router;