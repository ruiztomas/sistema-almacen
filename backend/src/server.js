require('dotenv').config();

const app=require('./app');
const connectDB=require('./config/db');

const expensesRoutes=require('./routes/expenses.routes');
const dashboardRoutes=require('./routes/dashboard.routes');
const authRoutes=require('./routes/auth.routes');
const errorHandler=require('./middleware/error.middleware');

const helmet=require("helmet");
const cors=require("cors");
const rateLimit=require("express-rate-limit");

connectDB();

const PORT=process.env.PORT || 3000;

app.use(helmet());
app.use(cors());

const limiter=rateLimit({
    windowMs:15*60*1000,
    max:100,
    message:'Demasiadas solicitudes, intente mas tarde'
});

app.use(limiter);

app.use('/api/expenses', expensesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/uploads',require('express').static('uploads'));
app.use(errorHandler);
app.listen(PORT,'0.0.0.0',()=>{
    console.log(`Servidor corriendo en puerto ${PORT}`);
});