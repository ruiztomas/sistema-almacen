const mongoose=require('mongoose');

const productSchema=new mongoose.Schema({
    nombre:{
        type: String,
        required: true
    },
    barcode:{
        type:String,
        unique:true,
        sparse:true
    },
    categoria:{
        type:String,
        enum:[
            'varios',
            'limpieza',
            'bebidas',
            'cigarrillos',
            'otros'
        ],
        default:'varios'
    },
    tipoVenta:{
        type: String,
        enum: ['unidad','peso'],
        required: true
    },
    precioCosto:{
        type:Number,
        required:true
    },
    precioUnitario: Number,
    precioKg: Number,
    stock: {
        type:Number,
        default:0
    },
    stockKg:{
        type:Number,
        default:0
    },
    stockMinimo:{
        type:Number,
        default: 3
    },

    activo:{
        type: Boolean,
        default: true
    }
},{timestamps: true});

module.exports=mongoose.model('Product', productSchema);