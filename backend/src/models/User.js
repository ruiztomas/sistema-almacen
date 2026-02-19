const mongoose=require('mongoose');
const bcrypt=require('bycript');

const userSchema=new mongoose.Schema({
    nombre:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['admin','empleado'],
        default:'empleado'
    }
},{timestamps:true});

userSchema.pre('save',async function(next){
    if(!this.isModified('password'))return next();
    this.password=await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword=function(password){
    return bcrypt.compare(password, this.password);
};

module.exports=mongoose.model('User', userSchema);