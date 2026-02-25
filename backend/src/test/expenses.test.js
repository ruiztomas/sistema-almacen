const request=require('supertest');
const app=require('../app');

describe('GET /api/expenses',()=>{
    it('deberia devolver 401 sin token',async()=>{
        const res=await request(app).get('/api/expenses');
        expect(res.statusCode).toBe(401);
    });
});