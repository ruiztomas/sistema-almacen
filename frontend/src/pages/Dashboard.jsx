import { useEffect, useState } from "react";
import api from "../api/axios";

import Expenses from "./Expenses";
import Clients from "./Clients";
import Products from "./Products";
import Sales from "./Sales";

function Dashboard(){
    const [data, setData]=useState(null);
    const [loading, setLoading]=useState(true);
    useEffect(()=>{
        const fetchDashboard=async()=>{
            try{
                const res=await api.get('/dashboard');
                setData(res.data);
            }catch(error){
                console.log(error);
            }finally{
                setLoading(false);
            }
        };
        fetchDashboard();
    },[]);

    if(loading){
        return <p>Cargando dashboard...</p>
    }
    return( 
        <div style={{maxWidth:'1200px', margin:'0 auto', fontFamily:'Arial, sans-serif'}}>
            <h1 style={{textAlign:'center', marginBottom:'20px'}}>Dashboard del Almacén</h1>

            <div style={{display:'flex', gap:'20px', marginBottom:'30px', flexWrap:'wrap'}}>
                <div style={{flex:'1 1 200px', padding:'20px', border:'1px solid #ccc', borderRadius:'8px'}}>
                    <h3>Total Gastos</h3>
                    <p>${data.totalExpenses || 0}</p>
                </div>
                <div style={{flex:'1 1 200px', padding:'20px', border:'1px solid #ccc', borderRadius:'8px'}}>
                    <h3>Cantidad de Gastos</h3>
                    <p>{data.count || 0}</p>
                </div>
                <div style={{flex:'1 1 200px', padding:'20px', border:'1px solid #ccc', borderRadius:'8px'}}>
                    <h3>Total Clientes (Fiados)</h3>
                    <p>{data.totalClients || 0}</p>
                </div>
                <div style={{flex:'1 1 200px', padding:'20px', border:'1px solid #ccc', borderRadius:'8px'}}>
                    <h3>Total Productos</h3>
                    <p>{data.totalProducts || 0}</p>
                </div>
                <div style={{flex:'1 1 200px', padding:'20px', border:'1px solid #ccc', borderRadius:'8px'}}>
                    <h3>Ventas Hoy</h3>
                    <p>${data.totalSalesToday || 0}</p>
                </div>
            </div>

            <section style={{marginBottom:'40px'}}>
                <h2>Gastos</h2>
                <Expenses />
            </section>

            <section style={{marginBottom:'40px'}}>
                <h2>Clientes / Fiados</h2>
                <Clients /> 
            </section>

            <section style={{marginBottom:'40px'}}>
                <h2>Productos</h2>
                <Products /> 
            </section>

            <section style={{marginBottom:'40px'}}>
                <h2>Ventas</h2>
                <Sales /> 
            </section>
        </div>
    );
}

export default Dashboard;