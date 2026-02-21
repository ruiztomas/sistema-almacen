const express=require('express');
const cors=require('cors');
const productsRoutes=require('./routes/products.routes');
const salesRoutes=require('./routes/sales.routes');
const clientsRoutes=require('./routes/clients.routes');
const expensesRoutes=require('./routes/expenses.routes');
const authRoutes=require('./routes/auth.routes');

const app=express();

app.use(cors());
app.use(express.json());
app.use('/api/products', productsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/expenses',expensesRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health',(req,res)=>{
    res.json({status:'ok'});
});
module.exports=app;