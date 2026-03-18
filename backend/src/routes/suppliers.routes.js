const express = require("express");
const router = express.Router();
const pool = require("../config/postgres");


// 🟢 CREAR PROVEEDOR
router.post("/", async (req, res) => {
  try {
    const { nombre, telefono } = req.body;

    const result = await pool.query(
      `INSERT INTO suppliers (nombre, telefono)
       VALUES ($1,$2)
       RETURNING *`,
      [nombre, telefono]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// 📋 LISTAR PROVEEDORES
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM suppliers ORDER BY id DESC"
    );

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 🔴 ELIMINAR PROVEEDOR
router.delete("/:id", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM suppliers WHERE id=$1",
      [req.params.id]
    );

    res.json({ message: "Proveedor eliminado" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;