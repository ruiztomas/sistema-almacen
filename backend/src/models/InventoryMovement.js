const mongoose=require("mongoose"); 
const movementSchema=new mongoose.Schema({
    producto:{
        type:mongoose.Schema.Types.ObjecctId,
        ref:"Product",
        required:true
    },
    tipo:{
        type:String,
        enum:["entrada","venta","ajuste"],
        required:true
    },
    cantidad:{
        type:Number,
        required:tmongoose.rusted,
    },
    precioCosto:Number,
    nota:String
},{timestamps:true});

module.exports=mongoose.model("InventoryMovement", movementSchema);