import { useEffect, useState } from "react";
import api from "../api/axios";

function Products() {
    const [products, setProducts] = useState([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [editingId, setEditingId] = useState(null);

    const fetchProducts = async () => {
        try {
            const res = await api.get("/products");
            setProducts(res.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/products/${editingId}`, { name, price: Number(price), stock: Number(stock) });
                setEditingId(null);
            } else {
                await api.post("/products", { name, price: Number(price), stock: Number(stock) });
            }
            setName(""); setPrice(""); setStock("");
            fetchProducts();
        } catch (error) {
            console.log(error);
        }
    };

    const handleEdit = (product) => {
        setName(product.name);
        setPrice(product.price);
        setStock(product.stock);
        setEditingId(product._id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Eliminar este producto?")) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div style={{display:"flex", flexWrap:"wrap", gap:"10px"}}>
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap:"wrap" }}>
                <input placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} required />
                <input type="number" placeholder="Precio" value={price} onChange={e => setPrice(e.target.value)} required />
                <input type="number" placeholder="Stock" value={stock} onChange={e => setStock(e.target.value)} required />
                <button type="submit">{editingId ? "Actualizar" : "Agregar"}</button>
            </form>

            <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p._id} style={{ backgroundColor: p.stock < 5 ? "#ffe0e0" : "transparent" }}>
                            <td>{p.name}</td>
                            <td>${p.price}</td>
                            <td>{p.stock}</td>
                            <td>
                                <button onClick={() => handleEdit(p)}>Editar</button>
                                <button onClick={() => handleDelete(p._id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Products;