const jwt=require('jsonwebtoken');
const SECRET='supersecreto';

function auth(req,res,next){
    const token=req.headers.authorization?.split(' ')[1];

    if(!token)return res.statuss(401).json({error:'No autorizado'});

    try{
        const decoded=jwt.verify(token,SECRET);
        req.user=decoded;
        next();
    }catch{
        res.status(401).json({error: 'Token invalido'});
    }
}
function onlyAdmin(req,res,next){
    if(req.user.role !== 'admin'){
        return res.status(403).json({error: 'Solo admin puede hacer esto'});
    }
    next();
}
module.exports={auth, onlyAdmin};