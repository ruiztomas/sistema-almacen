const express = require("express");
const router = express.Router();
const pool = require("../config/postgres");

// 🔥 CREAR VENTA
router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const { items, clienteId, fiado, metodoPago } = req.body;
    await client.query("BEGIN");

    // 🔐 Obtener caja abierta
    const cajaRes = await client.query(
      "SELECT * FROM cash_sessions WHERE closed_at IS NULL LIMIT 1"
    );
    const caja = cajaRes.rows[0];
    if (!caja) throw new Error("No hay caja abierta");

    let total = 0;

    // 📦 PROCESAR ITEMS
    for (const item of items) {
      const productRes = await client.query(
        "SELECT * FROM products WHERE id=$1",
        [item.product_id]
      );
      const product = productRes.rows[0];
      if (!product) throw new Error("Producto no encontrado");

      // 🔥 CONTROL STOCK
      if (product.tipo_venta === "unidad") {
        if (product.stock < item.cantidad) throw new Error("Stock insuficiente");
        await client.query(
          "UPDATE products SET stock = stock - $1 WHERE id=$2",
          [item.cantidad, product.id]
        );
      } else {
        if (product.stock_kg < item.cantidad) throw new Error("Stock insuficiente (kg)");
        await client.query(
          "UPDATE products SET stock_kg = stock_kg - $1 WHERE id=$2",
          [item.cantidad, product.id]
        );
      }

      const subtotal = item.cantidad * item.precio;
      const ganancia = subtotal - (item.cantidad * product.precio_costo);
      total += subtotal;

      await client.query(
        `INSERT INTO inventory_movements 
         (producto_id, tipo, cantidad, precio_costo, nota)
         VALUES ($1,'venta',$2,$3,$4)`,
        [product.id, item.cantidad, product.precio_costo, "Venta realizada"]
      );

      item.subtotal = subtotal;
      item.precio_costo = product.precio_costo;
      item.ganancia = ganancia;
    }

    // 💾 CREAR VENTA
    const saleRes = await client.query(
      `INSERT INTO sales 
       (client_id, total, fiado, estado, metodo_pago)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        clienteId || null,
        total,
        fiado || false,
        fiado ? "pendiente" : "pagada",
        metodoPago || "efectivo"
      ]
    );
    const sale = saleRes.rows[0];

    // 💰 REGISTRAR MOVIMIENTO DE CAJA vinculado a caja abierta
    await client.query(
      `INSERT INTO cash_movements
       (type, amount, metodo_pago, reference_id, cash_session_id)
       VALUES ('ingreso', $1, $2, $3, $4)`,
      [total, metodoPago || "efectivo", sale.id, caja.id]
    );

    // 📦 GUARDAR ITEMS
    for (const item of items) {
      await client.query(
        `INSERT INTO sale_details
         (sale_id, product_id, cantidad, precio_venta, precio_costo, subtotal, ganancia)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [sale.id, item.product_id, item.cantidad, item.precio, item.precio_costo, item.subtotal, item.ganancia]
      );
    }

    // 🧾 FIADO
    if (fiado && clienteId) {
      await client.query(
        `INSERT INTO cash_movements(type, amount, metodo_pago, reference_id, cash_session_id)
        VALUES('ingreso',$1,$2,$3,$4)`,
        [total,metodoPago,sale.id,caja.id]
      );
    }

    await client.query("COMMIT");
    res.status(201).json(sale);

  } catch (error) {
    await client.query("ROLLBACK");
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;