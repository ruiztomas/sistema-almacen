const mongoose=require('mongoose');

const productSchema=new mongoose.Schema({
    nombre:{
        type: String,
        required: true
    },
    categoria:String,

    tipoVenta:{
        type: String,
        enum: ['unidad','peso'],
        required: true
    },
    precioUnitario: Number,
    stock: Number,

    precioKg: Number,
    stockKg: Number,

    stockMinimo:{
        type:Number,
        default: 0
    },

    activo:{
        type: Boolean,
        default: true
    }
},{timestamps: true});

module.exports=mongoose.model('Product', productSchema);