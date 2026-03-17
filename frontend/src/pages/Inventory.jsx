import { useEffect,useState } from "react";
import api from "../api/axios";

function Inventory(){
    const [movements, setMovements]=useState([]);

    //obtener movimientos
    const fetchMovements=async()=>{
        try{
            const res=await api.get("/inventory/movements");
            setMovements(res.data || []);
        }catch(error){
            console.log(error);
        }
    };
    useEffect(()=>{
        fetchMovements();
    },[]);
    return(
        <div style={{maxWidth:"900px"}}>
            <h2>Movimiento de Inventario</h2>
            <table border="1" style={{width:"100%", borderCollapse:"collapse", marginTop:"20px"}}>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Tipo</th>
                        <th>Cantidad</th>
                        <th>Costo</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    {movements.map(m=>(
                        <tr key={m._id}>
                            <td>
                                {m.producto?.nombre || "Producto eliminado"}
                            </td>
                            <td>
                                {m.tipo}
                            </td>
                            <td>
                                {m.cantidad}
                            </td>
                            <td>
                                ${m.precioCosto || 0}
                            </td>
                            <td>
                                {new Date(m.createdAt).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default Inventory;