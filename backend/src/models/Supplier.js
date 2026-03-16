const mongoose=require("mongoose");
const supplierSchema=new mongoose.Schema({
    nombre:{
        type:String,
        required:true
    },
    telefono:String,
    createdAt:{
        type:Date,
        default:Date.now
    }
});

module.exports=mongoose.model("Supplier",supplierSchema);