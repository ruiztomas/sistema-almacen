const app=require('./app');
const connectDB=require('./config/db');
const expensesRoutes=require('./routes/expenses.routes');

connectDB();

const PORT=3000;

app.use('/api/expenses', expensesRoutes);
app.listen(PORT,'0.0.0.0',()=>{
    console.log(`Servidor corriendo en puerto ${PORT}`);
});