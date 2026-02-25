const mongoose=require('mongoose');
const request=require('supertest');
const app=require('../app');
const connectDB=require('../config/db');
const User=require('../models/User');

describe('Auth endpoints', ()=>{
    beforeAll(async()=>{
        await connectDB();
        //Se crea usuario para test
        await User.create({
            nombre:'Administrador',
            username:'admin',
            password:'123456',
            role:'admin'
        });
    });
    it('Debe devolver 401 si intento acceder a expenses sin token',async()=>{
        const res=await request(app).get('/api/expenses');
        expect(res.statusCode).toBe(401);
    });

    it('Debe loguear correctamente un usuario existente',async()=>{
        const res=await request(app)
            .post('/api/auth/login')
            .send({
                username:'admin',
                password:'123456'
            });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    afterAll(async()=>{
        await mongoose.connection.close();
    });
});