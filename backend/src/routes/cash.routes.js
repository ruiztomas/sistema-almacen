const express = require("express");
const router = express.Router();
const pool = require("../config/postgres");
const { auth } = require("../middleware/auth.middleware");


// 🟢 ABRIR CAJA
router.post("/open", auth, async (req, res) => {
  try {
    const { montoInicial } = req.body;

    // ❗ verificar si ya hay una caja abierta
    const existe = await pool.query(
      "SELECT * FROM cash_sessions WHERE closed_at IS NULL"
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ error: "Ya hay una caja abierta" });
    }

    const result = await pool.query(
      `INSERT INTO cash_sessions (opening_amount)
       VALUES ($1)
       RETURNING *`,
      [montoInicial]
    );

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 📊 ESTADO DE CAJA
router.get("/status", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM cash_sessions WHERE closed_at IS NULL LIMIT 1"
    );

    res.json(result.rows[0] || null);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/close", auth, async (req, res) => {
  try {
    const { montoFinal } = req.body;

    const cajaRes = await pool.query(
      "SELECT * FROM cash_sessions WHERE closed_at IS NULL LIMIT 1"
    );
    const caja = cajaRes.rows[0];

    if (!caja) return res.status(400).json({ error: "No hay caja abierta" });

    // 1️⃣ USAR EL NOMBRE CORRECTO: monto_inicial (según tu base de datos)
    const montoInicial = Number(caja.monto_inicial || 0); 

    const ingresosRes = await pool.query(
      "SELECT COALESCE(SUM(amount),0) AS total FROM cash_movements WHERE type='ingreso' AND cash_session_id = $1",
      [caja.id]
    );
    const egresosRes = await pool.query(
      "SELECT COALESCE(SUM(amount),0) AS total FROM cash_movements WHERE type='egreso' AND cash_session_id = $1",
      [caja.id]
    );

    const ingresos = Number(ingresosRes.rows[0].total);
    const egresos = Number(egresosRes.rows[0].total);

    // 2️⃣ Cálculo seguro
    const montoEsperado = montoInicial + ingresos - egresos;
    const diferencia = Number(montoFinal) - montoEsperado;

    // 3️⃣ Update con nombres de columnas correctos
    const update = await pool.query(
      `UPDATE cash_sessions 
       SET closing_amount=$1, expected_amount=$2, difference=$3, closed_at=NOW() 
       WHERE id=$4 RETURNING *`,
      [Number(montoFinal), montoEsperado, diferencia, caja.id]
    );

    res.json({
      message: "Caja cerrada correctamente",
      caja: update.rows[0],
      montoEsperado,
      diferencia
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cerrar caja" });
  }
});

module.exports = router;