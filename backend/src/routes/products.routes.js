const express = require("express");
const router = express.Router();
const pool = require("../config/postgres");

// 🔹 CREAR PRODUCTO
router.post("/", async (req, res) => {
  try {
    const {
      nombre,
      barcode,
      categoria,
      tipoVenta,
      precioCosto,
      precioUnitario,
      precioKg,
      stock,
      stockKg,
      stockMinimo
    } = req.body;

    const result = await pool.query(
      `INSERT INTO products 
      (nombre, barcode, categoria, tipo_venta, precio_costo, precio_unitario, precio_kg, stock, stock_kg, stock_minimo)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
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
        stockKg || 0,
        stockMinimo || 3
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 🔹 GET PRODUCTOS
router.get("/", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM products WHERE activo = true ORDER BY nombre ASC"
  );
  res.json(result.rows);
});


// 🔹 UPDATE
router.put("/:id", async (req, res) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (let key in req.body) {
    fields.push(`${key} = $${index}`);
    values.push(req.body[key]);
    index++;
  }

  values.push(req.params.id);

  const result = await pool.query(
    `UPDATE products SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`,
    values
  );

  res.json(result.rows[0]);
});


// 🔹 DELETE (soft delete)
router.delete("/:id", async (req, res) => {
  await pool.query(
    "UPDATE products SET activo = false WHERE id = $1",
    [req.params.id]
  );
  res.json({ message: "Producto desactivado" });
});


// 🔹 LOW STOCK
router.get("/alerts/low-stock", async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM products
    WHERE activo = true AND (
      (tipo_venta = 'unidad' AND stock <= stock_minimo) OR
      (tipo_venta = 'peso' AND stock_kg <= stock_minimo)
    )
  `);

  res.json(result.rows);
});


// 🔹 INVENTORY VALUE
router.get("/inventory-value", async (req, res) => {
  const result = await pool.query(`
    SELECT SUM(
      (stock * precio_costo) + (stock_kg * precio_costo)
    ) AS total
    FROM products
  `);

  res.json({
    total: result.rows[0].total || 0
  });
});


// 🔹 COUNT
router.get("/count", async (req, res) => {
  const result = await pool.query(
    "SELECT COUNT(*) FROM products WHERE activo = true"
  );

  res.json({
    total: parseInt(result.rows[0].count)
  });
});


// 🔹 POR CATEGORIA
router.get("/category/:cat", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM products WHERE categoria = $1 AND activo = true",
    [req.params.cat]
  );

  res.json(result.rows);
});


// 🔹 RESTOCK
router.post("/:id/restock", async (req, res) => {
  const { cantidad } = req.body;

  const productRes = await pool.query(
    "SELECT * FROM products WHERE id = $1",
    [req.params.id]
  );

  const product = productRes.rows[0];

  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  let newStock = product.stock;
  let newStockKg = product.stock_kg;

  if (product.tipo_venta === "unidad") {
    newStock += cantidad;
  } else {
    newStockKg += cantidad;
  }

  const updated = await pool.query(
    `UPDATE products 
     SET stock = $1, stock_kg = $2 
     WHERE id = $3 RETURNING *`,
    [newStock, newStockKg, req.params.id]
  );

  // 🔥 movimiento inventario
  await pool.query(
    `INSERT INTO inventory_movements (producto_id, tipo, cantidad, precio_costo)
     VALUES ($1, 'entrada', $2, $3)`,
    [req.params.id, cantidad, product.precio_costo]
  );

  res.json(updated.rows[0]);
});


// 🔹 RESTOCK ALERTS (igual que low stock)
router.get("/restock-alerts", async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM products
    WHERE activo = true AND (
      (tipo_venta = 'unidad' AND stock <= stock_minimo) OR
      (tipo_venta = 'peso' AND stock_kg <= stock_minimo)
    )
  `);

  res.json(result.rows);
});


// 🔹 PLAN DE REPOSICION
router.get("/restock-plan", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM products WHERE activo = true"
  );

  const reposicion = [];
  let dineroNecesario = 0;

  result.rows.forEach(p => {
    let stockActual =
      p.tipo_venta === "unidad" ? p.stock : p.stock_kg;

    if (stockActual <= p.stock_minimo) {
      const cantidadComprar =
        (p.stock_minimo * 2) - stockActual;

      const costo = cantidadComprar * p.precio_costo;

      dineroNecesario += costo;

      reposicion.push({
        producto: p.nombre,
        comprar: cantidadComprar,
        costo
      });
    }
  });

  res.json({
    productos: reposicion,
    dineroNecesario
  });
});

module.exports = router;