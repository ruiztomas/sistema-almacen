const express=require('express');
const router=express.Router();
const Client=require('../models/Client');
const Sale=require('../models/Sale');

router.post('/',async(res,res)=>{
    const client=new Client(req.body);
    await client.save();
    res.status(201).json(client);
});

router.get('/',async(req,res)=>{
    const clients=await Client.find({activo: true});
    res.json(clients);
});

router.post('/id:pago',async(req,res)=>{
    const {monto}=req.body;
    const client=await Client.findById(req.params.id);
    client.saldoFiado-=monto;

    if(client.saldoFiado<0)client.saldoFiado=0;
    await client.save();

    res.json(client);
});

module.exports=router;