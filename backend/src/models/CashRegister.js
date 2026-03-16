const mongoose=require("mongoose");
const cashRegisterSchema=new mongoose.Schema({
    abierta:{
        type: Boolean,
        default: true
    },
    montoInicial:{
        type: Number,
        required: true
    },
    montoFinal: Number,
    ventasEfectivo:{
        type:Number,
        default:0
    },
    gastos:{
        type: Number,
        default:0
    },
    diferencia: Number,
    openedAt:{
        type: Date,
        default: Date.now
    },
    closedAt: Date
});

module.exports=mongoose.model("")