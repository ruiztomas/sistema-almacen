const mongoose=require('mongoose');

const saleSchema=new mongoose.Schema({
    cliente:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Client'
    },
    items:[
        {
            producto:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            cantidad: Number,
            precio: Number,
            precioCosto:Number,
            subtotal: Number,
            ganancia: Number
        }
    ],
    total: Number,
    fiado:{
        type: Boolean,
        default: false
    },
    estado:{
        type: String,
        enum: ['pendiente', 'pagada'],
        default: 'pagada'
    },
    metodoPago:{
        type: String,
        enum: ["efectivo", "transferencia"],
        default: "efectivo"
    },
    pago: String
}, {timestamps: true});

module.exports=mongoose.model('Sale', saleSchema);