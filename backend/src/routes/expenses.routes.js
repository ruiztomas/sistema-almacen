const express = require("express");
const router = express.Router();
const pool = require("../config/postgres");
const { body, validationResult } = require("express-validator");
const { auth } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

// CREAR GASTO + IMPACTO EN CAJA
router.post(
  "/",
  auth,
  upload.single("comprobante"),
  [
    body("descripcion").notEmpty(),
    body("categoria").notEmpty(),
    body("monto").isNumeric(),
  ],
  async (req, res) => {
    const client = await pool.connect();

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: errors.array() });

      const { descripcion, categoria, monto } = req.body;
      await client.query("BEGIN");

      // 💾 GUARDAR GASTO
      const expenseRes = await client.query(
        `INSERT INTO expenses
        (descripcion, categoria, monto, user_id, comprobante)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *`,
        [descripcion, categoria, monto, req.user.id, req.file ? req.file.filename : null]
      );
      const expense = expenseRes.rows[0];

      // 🔐 Obtener caja abierta
      const cajaRes = await client.query(
        "SELECT * FROM cash_sessions WHERE closed_at IS NULL LIMIT 1"
      );
      const caja = cajaRes.rows[0];

      if (caja) {
        // 💸 REGISTRAR EGRESO en caja abierta
        await client.query(
          `INSERT INTO cash_movements
           (type, amount, metodo_pago, reference_id, cash_session_id)
           VALUES ('egreso', $1, 'efectivo', $2, $3)`,
          [monto, expense.id, caja.id]
        );
      }

      await client.query("COMMIT");
      res.status(201).json(expense);

    } catch (error) {
      await client.query("ROLLBACK");
      res.status(400).json({ error: error.message });
    } finally {
      client.release();
    }
  }
);

module.exports = router;