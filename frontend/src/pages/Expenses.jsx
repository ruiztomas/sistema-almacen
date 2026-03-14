import { useEffect, useState } from "react";
import api from "../api/axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function Expenses(){
    const [expenses, setExpenses]=useState([]);
    const [description, setDescription]=useState('');
    const [categoria,setCategoria]=useState('');
    const [amount,setAmount]=useState('');
    const [comprobante, setComprobante]=useState(null);
    const [editingId,setEditingId]=useState(null);
    const [filterCategoria, setFilterCategoria]=useState('');
    const [page, setPage]=useState(1);
    const [totalPages, setTotalPages]=useState(1);

    const [total, setTotal]=useState(0);
    const [categoryData, setCategoryData]=useState([]);

    const fetchExpenses=async(pageNumber=1)=>{
        try{
            const res=await api.get('/expenses',{
                params:{
                    page,
                    categoria: filterCategoria
                }
            });
            setExpenses(res.data.data || []);
            setPage(res.data.page);
            setTotalPages(res.data.totalPages);
        }catch(error){
            console.log(error);
        }
    };

    const fetchTotal=async()=>{
        try{
            const res=await api.get('/expenses/stats/total');
            setTotal(res.data.total);
        }catch(error){
            console.log(error);
        }
    };

    const fetchCategoryStats=async()=>{
        try{
            const res=await api.get('/expenses/stats/by-category');
            const data=res.data.map(item=>({
                categoria: item._id,
                total: item.total
            }));
            setCategoryData(data);
        }catch(error){
            console.log(error);
        }
    };

    useEffect(()=>{
        fetchExpenses(1);
        fetchTotal();
        fetchCategoryStats();
    },[filterCategoria]);

    const handleSubmit=async(e)=>{
        e.preventDefault();

        try{
            const formData=new FormData();
            formData.append('description',description);
            formData.append('categoria',categoria);
            formData.append('monto',Number(amount));
            if(comprobante) formData.append('comprobante',comprobante);
            if(editingId){
                await api.put(`/expenses/${editingId}`,formData,{
                    headers: { 'Content-Type':'multipart/form-data'}
                });
                setEditingId(null);
            }else{
                await api.post('/expenses', formData,{
                    headers:{'Content-Type':'multipart/form-data'}
                });
            }
            setDescription('');
            setCategoria('');
            setAmount('');
            setComprobante(null);

            fetchExpenses(page);
            fetchTotal();
            fetchCategoryStats();
        }catch(error){
            console.log(error);
        }
    };

    const handleDelete=async(id)=>{
        const confirmar=window.confirm("¿Seguro que querés eliminar este gasto?");
        if(!confirmar) return;

        try{
            await api.delete(`/expenses/${id}`);
            fetchExpenses(page);
            fetchTotal();
            fetchCategoryStats();
        }catch(error){
            console.log(error);
        }
    };

    const handleEdit=(expense)=>{
        setDescription(expense.description);
        setCategoria(expense.categoria);
        setAmount(expense.monto);
        setEditingId(expense._id);
    };

    return(
        <div>
            <h2>Agregar gasto</h2>

            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <input 
                    placeholder="Descripcion"
                    value={description}
                    required
                    onChange={(e)=>setDescription(e.target.value)}
                />

                <select
                    value={categoria}
                    required
                    onChange={(e)=>setCategoria(e.target.value)}
                >
                    <option value="">Seleccionar categoria</option>
                    <option value="Varios">Varios</option>
                    <option value="Limpieza">Limpieza</option>
                    <option value="Bebidads">Bebidas</option>
                    <option value="Cigarrillos">Cigarrillos</option>
                    <option value="Otros">Otros</option>
                </select>

                <input 
                    type="number"
                    placeholder="Monto"
                    value={amount}
                    required
                    onChange={(e)=>setAmount(Number(e.target.value))}
                />

                <input type="file" onChange={(e)=>setComprobante(e.target.files[0])} />

                <button type="submit">
                    {editingId ? "Actualizar":"Agregar"}
                </button>
            </form>

            <h3>Filtrar por categoria</h3>
            <select
                value={filterCategoria}
                onChange={(e)=>setFilterCategoria(e.target.value)}
            >
                <option value="">Todas</option>
                <option value="Varios">Varios</option>
                <option value="Limpieza">Limpieza</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Cigarrillos">Cigarrillos</option>
                <option value="Otros">Otros</option>
            </select>

            <h3>Total de gastos:${total}</h3>

            <h3>Gastos por categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                    <XAxis dataKey="categoria" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>

            <h2>Lista de gastos</h2>

            <table border="1">
                <thead>
                    <tr>
                        <th>Descripcion</th>
                        <th>Categoria</th>
                        <th>Monto</th>
                        <th>Fecha</th>
                        <th>Comprobante</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {Array.isArray(expenses)&&expenses.map((expense)=>(
                        <tr key={expense._id}>
                            <td>{expense.description}</td>
                            <td>{expense.categoria}</td>
                            <td>{expense.monto}</td>
                            <td>{new Date(expense.fecha).toLocaleString()}</td>
                            <td>
                                {expense.comprobante ? (
                                    <a
                                        href={`http://localhost:3000/uploads/${expense.comprobante}`} 
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Ver
                                    </a>
                                ) : 'Sin comprobante'}
                            </td>
                            <td>
                                <button onClick={()=>handleEdit(expense)}>Editar</button>
                                <button onClick={()=>handleDelete(expense._id)}>Eliminar</button>
                            </td>
                        </tr> 
                    ))}
                </tbody>
            </table>
            <div>
                <button disabled={page===1} onClick={()=>fetchExpenses(page-1)}>Anterior</button>
                <span>Pagina {page} de {totalPages}</span>
                <button disabled={page===totalPages} onClick={()=>fetchExpenses(page+1)}>Siguiente</button>
            </div>
        </div>
    );
}

export default Expenses;