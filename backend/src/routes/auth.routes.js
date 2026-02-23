const express=require('express');
const router=express.Router();
const jwt=require('jsonwebtoken');
const User=require('../models/User');

const SECRET='supercreto';

router.post('/register', async(req,res)=>{
    const user=new User(req.body);
    await user.save();
    res.status(201).json(user);
});

router.post('/login',async(req,res)=>{
    const {username, password}=req.body;

    const user=await User.findOne({username});
    if(!user)return res.status(400).json({error:'Usuario no encontrado'});

    const valid=await user.comparePassword(password);
    if(!valid)return res.status(400).json({error:'Contraseña incorrecta'});

    const token=jwt.sign(
        {id:user._id,role:user.role},
        'supersecreto',
        {expiresIn:'8h'}
    );
    res.json({token, role:user.role});
});

module.exports=router;