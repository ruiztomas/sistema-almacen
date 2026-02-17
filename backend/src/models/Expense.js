const mongoose=require('mongoose');

const expenseSchema=new mongoose.Schema({
    description:{
        type: String,
        required: true
    },
    categoria:{
        type: String,
        required: true
    },
    monto:{
        type: Number,
        required: true
    },
    fecha:{
        type: Date,
        default:Date.now
    },
    observaciones: String
},{timestamps:true});

module.exports=mongoose.model('Expense', expenseSchema);