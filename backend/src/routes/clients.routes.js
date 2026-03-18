const express = require("express");
const router = express.Router();
const pool = require("../config/postgres");

// ====================
// CREAR CLIENTE
// ====================
router.post("/", async (req, res) => {
  try {
    const { nombre, telefono } = req.body;

    // Validación
    if (!nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const result = await pool.query(
      `INSERT INTO clients (nombre, telefono, saldo_fiado, activo)
       VALUES ($1, $2, 0, true)
       RETURNING *`,
      [nombre, telefono || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ====================
// OBTENER CLIENTES ACTIVOS
// ====================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM clients WHERE activo = true ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====================
// OBTENER CLIENTE POR ID
// ====================
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM clients WHERE id = $1 AND activo = true",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====================
// ACTUALIZAR CLIENTE
// ====================
router.put("/:id", async (req, res) => {
  try {
    const fields = [];
    const values = [];
    let index = 1;

    for (let key in req.body) {
      fields.push(`${key} = $${index}`);
      values.push(req.body[key]);
      index++;
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No se enviaron campos para actualizar" });
    }

    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE clients SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ====================
// SOFT DELETE CLIENTE
// ====================
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE clients SET activo = false WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({ message: "Cliente desactivado", cliente: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====================
// PAGAR FIADO
// ====================
router.post("/:id/pago", async (req, res) => {
  try {
    const { monto } = req.body;

    if (monto == null || monto <= 0) {
      return res.status(400).json({ error: "Monto inválido" });
    }

    const result = await pool.query(
      `UPDATE clients
       SET saldo_fiado = GREATEST(saldo_fiado - $1, 0)
       WHERE id = $2 AND activo = true
       RETURNING *`,
      [monto, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;