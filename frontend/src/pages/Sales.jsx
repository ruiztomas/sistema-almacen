import { useEffect, useState } from "react";
import api from "../api/axios";

function Sales() {
    const [sales, setSales] = useState([]);
    const [product, setProduct] = useState("");
    const [quantity, setQuantity] = useState("");
    const [total, setTotal] = useState("");

    const fetchSales = async () => {
        try {
            const res = await api.get("/sales");
            setSales(res.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/sales", { product, quantity: Number(quantity), total: Number(total) });
            setProduct(""); setQuantity(""); setTotal("");
            fetchSales();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap:"wrap" }}>
                <input placeholder="Producto" value={product} onChange={e => setProduct(e.target.value)} required />
                <input type="number" placeholder="Cantidad" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                <input type="number" placeholder="Total" value={total} onChange={e => setTotal(e.target.value)} required />
                <button type="submit">Agregar Venta</button>
            </form>

            <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Total</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    {sales.map(s => (
                        <tr key={s._id}>
                            <td>{s.product}</td>
                            <td>{s.quantity}</td>
                            <td>${s.total}</td>
                            <td>{new Date(s.date).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Sales;