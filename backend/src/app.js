const express=require('express');
const cors=require('cors');
const productsRoutes=require('./routes/products.routes');
const salesRoutes=require('./routes/sales.routes');
const clientsRoutes=require('./routes/clients.routes');
const expensesRoutes=require('./routes/expenses.routes');
const authRoutes=require('./routes/auth.routes');
const path=require('path');

const app=express();

const allowedOrigins=['http://127.0.0.1:5173','http://localhost:5173'];
app.use(cors({
    origin:function(origin, callback){
        if(!origin)return callback(null,true);
        if(allowedOrigins.includes(origin)){
            callback(null, true);
        }else{
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use('/api/products', productsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/expenses',expensesRoutes);
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health',(req,res)=>{
    res.json({status:'ok'});
});
module.exports=app;