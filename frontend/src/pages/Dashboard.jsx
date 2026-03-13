import { useEffect, useState } from "react";
import api from "../api/axios";

function Dashboard(){

    const [data, setData]=useState(null);
    useEffect(()=>{
        const fetchDashboard=async()=>{
            try{
                const res=await api.get('/dashboard');
                setData(res.data);
            }catch(error){
                console.log(error);
            }
        };
        fetchDashboard();
    },[]);
    return( 
        <div>
            <h1>Dashboard</h1>
            
            {data ?(
                <div>
                    <p>Total gastos: {data.totalExpenses}</p>
                    <p>Cantidad de gastos: {data.count}</p>
                </div>
            ):(
                <p>Cargando datos...</p> 
            )}
        </div>  
    );
}

export default Dashboard;