const mongoose=require('mongoose');

const clientSchema=new mongoose.Schema({
    nombre:{
        type: String,
        required: true
    },
    telefono: String,

    saldoFiado:{
        type: Number,
        default: 0
    },

    activo:{
        type: Boolean,
        default: true
    }
}, {timestamps: true});

module.exports=mongoose.model('Client', clientSchema);