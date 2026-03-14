const mongoose=require("mongoose"); 
const inventoryMovementSchema=new mongoose.Schema({
    producto:{
        type:mongoose.Schema.Types.ObjectId,
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
        required:true
    },
    precioCosto:Number,
    nota:String
},{timestamps:true});

module.exports=mongoose.model("InventoryMovement", inventoryMovementSchema);