const { Pool }=require("pg");

const pool=new Pool({
    user:"almacen_user",
    host:"localhost",
    database:"almacen",
    password:"123456",
    port:5432,
});

pool.query("SELECT NOW()")
    .then(()=>console.log("PostgreSQL conectado"))
    .catch(err=>console.log(err));

module.exports=pool;