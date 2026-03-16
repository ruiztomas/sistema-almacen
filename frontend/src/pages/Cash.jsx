import { useEffect, useState } from "react";
import api from "../api/axios";

function Cash(){
    const [cash,setCash]=useState(null);
    const [montoInicial,setMontoInicial]=useState("");
    const [montoFinal,setMontoFinal]=useState("");

    //estado de caja
    const  fetchCash=async()=>{
        try{
            const res=await api.get("/cash/status");
            setCash(res.data);
        }catch(error){
            console.log(error);
        }
    };
    useEffect(()=>{
        fetchCash();
    },[]);
    //abrir caja
    const openCash=async()=>{
        try{
            await api.post("/cash/open",{
                montoInicial:Number(montoInicial)
            });
            setMontoInicial("");
            fetchCash();
        }catch(error){
            console.log(error);
        }
    };
    //cerra caja
    const closeCash=async()=>{
        try{
            await api.post("/cash/close",{
                montoFinal:Number(montoFinal)
            });
            setMontoFinal("");
            fetchCash();
        }catch(error){
            console.log("error");
        }
    };
    return(
        <div style={{maxWidth:"600px", margin:"auto"}}>
            <h2>Caja</h2>

            {!cash && (
                <div>
                    <h3>Abrir caja</h3>
                    <input type="number" placeholder="Monto inicial" value={montoInicial} onChange={(e)=>setMontoInicial(e.target.value)} />
                    <button onClick={openCash}>
                        Abrir caja
                    </button>   
                </div>
            )}

            {cash && cash.abierta && (
                <div>
                    <h3>Caja abierta</h3>
                    <p>
                        Caja inicial: ${cash.montoInicial}
                    </p>
                    <p>
                        Ventas efectivo: ${cash.ventasEfectivo || 0}
                    </p>
                    <p>
                        Gastos: ${cash.gastos || 0}
                    </p>
                    <hr/>

                    <h3>Cerrar caja</h3>
                    <input type="number" placeholder="Dinero en caja" value={montoFinal} onChange={(e)=>setMontoFinal(e.target.value)} />
                    <button onClick={closeCash}>
                        Cerrar caja
                    </button>
                </div>
            )}

            {cash && !cash.abierta && (
                <div>
                    <h3>Caja cerrada</h3>
                    <p>
                        Caja inicial: ${cash.montoInicial}
                    </p>
                    <p>
                        Dinero final: ${cash.montoFinal}
                    </p>
                    <p>
                        Diferencia: ${cash.diferencia}
                    </p>
                </div>
            )}
        </div>
    );
}
export default Cash;