const pool=require("../config/postgres");

//Obtener todos los productos
const getAllProducts=async()=>{
    const result=await pool.query("SELECT * FROM products ORDER BY id DESC");
    return result.rows;
};

//Crear producto
const createProduct=async(data)=>{
    const{
        nombre,
        barcode,
        categoria,
        tipoVenta,
        precioCosto,
        precioUnitario,
        precioKg,
        stock,
        stockKg,
    }=data;
    const result=await pool.query(
        `INSERT INTO products
        (nombre,barcode,categoria,tipo_venta,precio_costo,precio_unitario,precio_kg,stock,stock_kg)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *`,
        [
            nombre,
            barcode,
            categoria,
            tipoVenta,
            precioCosto,
            precioUnitario,
            precioKg,
            stock || 0,
            stockKg || 0
        ]
    );
    return result.rows[0];
};

module.exports={
    getAllProducts,
    createProduct
};