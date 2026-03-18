require('dotenv').config();

const app=require('./app');
const expensesRoutes=require('./routes/expenses.routes');
const salesRoutes=require('./routes/sales.routes');
const dashboardRoutes=require('./routes/dashboard.routes');
const authRoutes=require('./routes/auth.routes');
const inventoryRoutes=require('./routes/inventory.routes');
const cashRoutes=require("./routes/cash.routes")
const suppliersRoutes=require("./routes/suppliers.routes");
const errorHandler=require('./middleware/error.middleware');

const helmet=require("helmet");
const rateLimit=require("express-rate-limit");

const pool=require('./config/postgres');
pool.connect()
    .then(()=>console.log("PostgreSQL conectado"))
    .catch(err=>console.error("Error al conectar PostgreSQL", err));

const PORT=process.env.PORT || 3000;

app.use(helmet());

const limiter=rateLimit({
    windowMs:15*60*1000,
    max:100,
    message:'Demasiadas solicitudes, intente mas tarde'
});

app.use(limiter);

app.use('/api/expenses', expensesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use("/api/cash", cashRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use('/uploads',require('express').static('uploads'));
app.use(errorHandler);
app.listen(PORT,'0.0.0.0',()=>{
    console.log(`Servidor corriendo en puerto ${PORT}`);
});