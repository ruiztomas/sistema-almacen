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
    montoEsperado:{
        type: Number,
        default: 0
    },
    ventasEfectivo:{
        type:Number,
        default:0
    },
    ventasTransferencia:{
        type: Number,
        default: 0
    },
    gastos:{
        type: Number,
        default:0
    },
    diferencia: {
        type:Number,
        default:0
    },
    cerrada: {
        type: Boolean,
        default: false
    },
    openedAt:{
        type: Date,
        default: Date.now
    },
    closedAt: Date
});

module.exports=mongoose.model("CashRegister", cashRegisterSchema);