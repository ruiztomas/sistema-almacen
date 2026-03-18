const express = require("express");
const router = express.Router();
const pool = require("../config/postgres");
const { auth } = require("../middleware/auth.middleware");

router.get("/", auth, async (req, res) => {
  try {
    const hoy = new Date();
    const inicio = new Date(hoy);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(hoy);
    fin.setHours(23, 59, 59, 999);

    // 💸 GANANCIA HOY
    const gananciaRes = await pool.query(
      `SELECT COALESCE(SUM(sd.cantidad * (p.precio_venta - p.precio_costo)),0) AS ganancia
       FROM sale_details sd
       JOIN products p ON sd.product_id = p.id
       JOIN sales s ON s.id = sd.sale_id
       WHERE s.created_at BETWEEN $1 AND $2`,
      [inicio, fin]
    );
    const gananciaHoy = Number(gananciaRes.rows[0].ganancia);

    // 📦 INVENTARIO (Cálculos de stock)
    const productsRes = await pool.query(`SELECT * FROM products WHERE activo = true`);
    let valorInventario = 0;
    let productosStockBajo = 0;
    let dineroReposicion = 0;
    let alertas = [];

    productsRes.rows.forEach(p => {
      const stockActual = p.tipo_venta === "unidad" ? Number(p.stock) : Number(p.stock_kg);
      valorInventario += stockActual * (Number(p.precio_costo) || 0);

      if (stockActual <= Number(p.stock_minimo)) {
        productosStockBajo++;
        const cantidadComprar = (Number(p.stock_minimo) * 2) - stockActual;
        dineroReposicion += cantidadComprar * (Number(p.precio_costo) || 0);
        alertas.push({ tipo: "stock", mensaje: `Stock bajo: ${p.nombre}` });
      }
    });

    // 💰 LÓGICA DE CAJA (Corregida)
    const cajaRes = await pool.query(`SELECT * FROM cash_sessions WHERE closed_at IS NULL LIMIT 1`);
    
    // Inicializamos variables en 0 para evitar el error de "undefined"
    let cajaInfo = { abierta: false };
    let ingresos = 0;
    let egresos = 0;

    if (cajaRes.rows.length > 0) {
      const caja = cajaRes.rows[0];

      const ingresosMovRes = await pool.query(
        "SELECT COALESCE(SUM(amount),0) AS total FROM cash_movements WHERE type = 'ingreso' AND cash_session_id = $1",
        [caja.id]
      );
      const egresosMovRes = await pool.query(
        "SELECT COALESCE(SUM(amount),0) AS total FROM cash_movements WHERE type = 'egreso' AND cash_session_id = $1",
        [caja.id]
      );

      ingresos = Number(ingresosMovRes.rows[0].total);
      egresos = Number(egresosMovRes.rows[0].total);
      
      // CAMBIO CLAVE: usamos monto_inicial en lugar de opening_amount
      const montoInicial = Number(caja.monto_inicial || 0);
      const diferencia = montoInicial + ingresos - egresos;

      cajaInfo = {
        abierta: true,
        montoInicial,
        ingresos,
        egresos,
        diferencia
      };

      if (diferencia < 0) {
        alertas.push({ tipo: "caja", mensaje: "Caja en negativo" });
      }
    } else {
      alertas.push({ tipo: "caja", mensaje: "No hay caja abierta" });
    }

    res.json({
      ventasHoy: ingresos, 
      gananciaHoy,
      valorInventario,
      productosStockBajo,
      dineroReposicion,
      gastosTotales: egresos,
      caja: cajaInfo,
      alertas
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;