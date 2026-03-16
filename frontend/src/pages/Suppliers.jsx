import { useEffect, useState } from "react";
import api from "../api/axios";

function Suppliers() {

const [suppliers,setSuppliers]=useState([]);

const [nombre,setNombre]=useState("");
const [telefono,setTelefono]=useState("");
const [direccion,setDireccion]=useState("");


// obtener proveedores
const fetchSuppliers=async()=>{
    try{
        const res=await api.get("/suppliers");
        setSuppliers(res.data || []);
    }catch(error){
        console.log(error);
    }
};

useEffect(()=>{
    fetchSuppliers();
},[]);


// crear proveedor
const createSupplier=async(e)=>{
    e.preventDefault();

    try{

        await api.post("/suppliers",{
            nombre,
            telefono,
            direccion
        });

        setNombre("");
        setTelefono("");
        setDireccion("");

        fetchSuppliers();

    }catch(error){
        console.log(error);
    }
};


// eliminar proveedor
const deleteSupplier=async(id)=>{
    try{

        await api.delete(`/suppliers/${id}`);

        fetchSuppliers();

    }catch(error){
        console.log(error);
    }
};


return(

<div style={{maxWidth:"700px"}}>

<h2>Proveedores</h2>


<form
onSubmit={createSupplier}
style={{
display:"flex",
gap:"10px",
flexWrap:"wrap",
marginBottom:"20px"
}}
>

<input
placeholder="Nombre"
value={nombre}
onChange={(e)=>setNombre(e.target.value)}
required
/>

<input
placeholder="Teléfono"
value={telefono}
onChange={(e)=>setTelefono(e.target.value)}
/>

<input
placeholder="Dirección"
value={direccion}
onChange={(e)=>setDireccion(e.target.value)}
/>

<button type="submit">
Agregar
</button>

</form>


<table
border="1"
style={{
width:"100%",
borderCollapse:"collapse"
}}
>

<thead>
<tr>
<th>Nombre</th>
<th>Teléfono</th>
<th>Dirección</th>
<th></th>
</tr>
</thead>

<tbody>

{suppliers.map(s=>(
<tr key={s._id}>

<td>{s.nombre}</td>
<td>{s.telefono}</td>
<td>{s.direccion}</td>

<td>
<button onClick={()=>deleteSupplier(s._id)}>
Eliminar
</button>
</td>

</tr>
))}

</tbody>

</table>

</div>

);

}

export default Suppliers;