const mongoose=require('mongoose');

const connectDB=async()=>{
    try{
        await mongoose.connect('mongodb://127.0.0.1:27917/almacen');
        console.Console.log('MongoBD conectado');
    }catch(error){
        console.error('Error MongoDB', error);
        process.exit(1);
    }
};
module.exports=connectDB;