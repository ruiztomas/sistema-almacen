import { useEffect, useState } from "react";
import api from "../api/axios";

function Clients() {
    const [clients, setClients] = useState([]);
    const [name, setName] = useState("");
    const [debt, setDebt] = useState("");
    const [editingId, setEditingId] = useState(null);

    const fetchClients = async () => {
        try {
            const res = await api.get("/clients");
            setClients(res.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/clients/${editingId}`, { name, debt: Number(debt) });
                setEditingId(null);
            } else {
                await api.post("/clients", { name, debt: Number(debt) });
            }
            setName("");
            setDebt("");
            fetchClients();
        } catch (error) {
            console.log(error);
        }
    };

    const handleEdit = (client) => {
        setName(client.name);
        setDebt(client.debt);
        setEditingId(client._id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Eliminar este cliente?")) return;
        try {
            await api.delete(`/clients/${id}`);
            fetchClients();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap:"wrap" }}>
                <input placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} required />
                <input type="number" placeholder="Deuda" value={debt} onChange={e => setDebt(e.target.value)} required />
                <button type="submit">{editingId ? "Actualizar" : "Agregar"}</button>
            </form>

            <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Deuda</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map(client => (
                        <tr key={client._id}>
                            <td>{client.name}</td>
                            <td>${client.debt}</td>
                            <td>
                                <button onClick={() => handleEdit(client)}>Editar</button>
                                <button onClick={() => handleDelete(client._id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Clients;