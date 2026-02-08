const express=require('express');
const cors=require('cors');
const productsRoutes=require('./routes/products.routes');
const salesRoutes=require('./routes/sales.routes');
const clientsRoutes=require('./routes/clients.routes');

const app=express();

app.use(cors());
app.use(express.join());
app.use('/api/products', productsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/clients', clientsRoutes);

app.get('/api/health',(req,res)=>{
    res.json({status:'ok'});
});
module.exports=app;