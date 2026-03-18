const express = require("express");
const router = express.Router();
const pool = require("../config/postgres");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {auth, onlyAdmin }=require("../middleware/auth.middleware");

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // 🔒 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, password, role)
       VALUES ($1,$2,$3)
       RETURNING id, username, role`,
      [username, hashedPassword, role || "user"]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    // 🔐 comparar password
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.name,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      id:user.id,
      username: user.username,
      role: user.role,
      token
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//RUTA PROTEGIDA (solo usuario logeados)
router.get("/me", auth, async(req,res)=>{
  try{
    const result=await pool.query(
      "SELECT id, username, role FROM users WHERE id=$1",
      [req.user.id]
    );
    res.json(result.rows[0]);
  }catch(err){
    res.status(500).json({error: err.message});
  }
});

//RUTA SOLO ADMIN
router.get("/all-users", auth, onlyAdmin, async(req,res)=>{
  try{
    const result=await pool.query(
      "SELECT id, username, role FROM users"
    );
    res.json(result.rows);
  }catch(err){
    res.status(500).json({error:err.message});
  }
});

module.exports = router;