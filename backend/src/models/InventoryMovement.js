const mongoose=require("mongoose"); 
const Product=require("./Product");

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

inventoryMovementSchema.pre("save", async function(next){
    const product=await Product.findById(this.producto);

    if(!product)return next(new Error("Producto no encontrado"));

    if(this.tipo==="entrada"){
        product.stock+=this.cantidad;
    }
    if (this.tipo==="venta"){
        if(product.stock<this.cantidad){
            throw new Error("Stock insuficiente");
        }
        product.stock-=this.cantidad;
    }
    if(this.tipo==="ajuste"){
        product.stock=this.cantidad;
    }
    await product.save();
    next();
});

module.exports=mongoose.model("InventoryMovement", inventoryMovementSchema);