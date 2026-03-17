import { useEffect, useState, useRef} from "react";
import api from "../api/axios";

function Sales() {

const [products,setProducts]=useState([]);
const [query,setQuery]=useState("");
const [cart,setCart]=useState([]);
const [metodoPago,setMetodoPago]=useState("efectivo");

const inputRef=useRef(null);

useEffect(()=>{
    const fetchProducts=async()=>{
        const res=await api.get("/products");
        setProducts(res.data || []);
    };
    fetchProducts();
},[]);

useEffect(()=>{
    inputRef.current?.focus();
}, []);

// 🔎 BUSCAR PRODUCTOS
const filtered=products.filter(p=>
    p.nombre.toLowerCase().includes(query.toLowerCase()) ||
    p.barcode?.includes(query)
);

useEffect(() => {
    const handleKeyDown=(e)=>{
        // ENTER → agrega el primer producto encontrado
        if (e.key==="Enter"){
            e.preventDefault();
            if (filtered.length>0){
                addProduct(filtered[0]);
            }
        }
        // F2 → registrar venta
        if(e.key==="F2"){
            e.preventDefault();
            sell();
        }
        // DELETE → eliminar último producto
        if(e.key==="Delete"){
            setCart(prev => prev.slice(0, -1));
        }
        // ESC → cancelar venta
        if(e.key==="Escape"){
            setCart([]);
            setQuery("");
        }
    };
    window.addEventListener("keydown", handleKeyDown);
    return()=>{
        window.removeEventListener("keydown", handleKeyDown);
    };
}, [filtered]);

// 🛒 AGREGAR AL CARRITO
const addProduct=(product)=>{
    const existing=cart.find(p=>p._id===product._id);
    if(existing){
        setCart(cart.map(p=>
            p._id===product._id ? {...p,cantidad:p.cantidad+1} : p
        ));
    }else{
        setCart([
            ...cart,
            {...product,cantidad:1}
        ]);
    }
};

// ❌ ELIMINAR DEL CARRITO
const removeProduct=(id)=>{
    setCart(cart.filter(p=>p._id!==id));
};

// 💰 TOTAL
const total=cart.reduce(
    (acc,item)=>acc+(item.precioUnitario*item.cantidad),
    0
);

// 📡 ENVIAR VENTA
const sell=async()=>{
    if(cart.length===0) return;
    try{
        const items=cart.map(p=>({
            producto:p._id,
            cantidad:p.cantidad
        }));
        await api.post("/sales",{
            items,
            metodoPago
        });
        setCart([]);
        setQuery("");
        alert("Venta registrada");
    }catch(error){
        console.log(error);
        alert("Error al registrar venta");
    }
};
return(
    <div style={{display:"flex",gap:"20px",flexWrap:"wrap"}}>
    {/* BUSCADOR */}
    <div style={{flex:"1"}}>
        <h3>Buscar producto</h3>
            <input
                ref={inputRef}
                type="text"
                placeholder="Buscar producto..."
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
                style={{width:"100%",padding:"8px",marginBottom:"10px"}}
            />
            <ul style={{maxHeight:"300px",overflowY:"auto"}}>
                {filtered.map(product=>(
                    <li
                        key={product._id}
                        onClick={()=>addProduct(product)}
                        style={{
                            cursor:"pointer",
                            padding:"8px",
                            borderBottom:"1px solid #ddd"
                        }}
                    >
                        {product.nombre} — ${product.precioUnitario}
                    </li>
                ))}

            </ul>
    </div>
    {/* CARRITO */}
    <div style={{flex:"1"}}>
        <h3>Carrito</h3>
            {cart.length===0 && <p>No hay productos</p>}
            {cart.map(item=>(
                <div
                    key={item._id}
                    style={{
                        display:"flex",
                        justifyContent:"space-between",
                        marginBottom:"6px"
                    }}
                >
                    <span>
                        {item.nombre} x{item.cantidad}
                    </span>
                    <span>
                        ${item.precioUnitario*item.cantidad}
                        <button
                            onClick={()=>removeProduct(item._id)}
                            style={{marginLeft:"10px"}}
                        >
                            ❌
                        </button>
                    </span>
                </div>
            ))}
        <hr/>
        <h3>Total: ${total}</h3>
            <select value={metodoPago} onChange={(e)=>setMetodoPago(e.target.value)} style={{width:"100%", padding:"8px", marginTop:"10px"}}>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
            </select>
            <button
                onClick={sell}
                style={{
                    marginTop:"10px",
                    padding:"10px",
                    width:"100%",
                    background:"green",
                    color:"white",
                    border:"none"
                }}
            >
                Registrar Venta
            </button>
        </div>
    </div>
    );
}

export default Sales;