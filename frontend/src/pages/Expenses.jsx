import { useEffect, useState } from "react";
import api from "../api/axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

function Expenses(){
    const [expenses, setExpenses]=useState([]);
    const [description, setDescription]=useState('');
    const [categoria,setCategoria]=useState('');
    const [amount,setAmount]=useState('');
    const [comprobante, setComprobante]=useState(null);
    const [fileError, setFileError]=useState('');
    const [preview, setPreview]=useState(null);
    const [editingId,setEditingId]=useState(null);
    const [filterCategoria, setFilterCategoria]=useState('');
    const [filterDesde, setFilterDesde]=useState('');
    const [filterHasta,setFilterHasta]=useState('');
    const [page, setPage]=useState(1);
    const [totalPages, setTotalPages]=useState(1);

    const [total, setTotal]=useState(0);
    const [categoryData, setCategoryData]=useState([]);

    const COLORS=["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00bfff"];

    const formatCurrency=(value)=>{
        return new Intl.NumberFormat('es-Ar',{
            style:'currency',
            currency:'ARS'
        }).format(value);
    };

    const fetchExpenses=async(pageNumber=1)=>{
        try{
            const res=await api.get('/expenses',{
                params:{
                    page: pageNumber,
                    categoria: filterCategoria,
                    desde: filterDesde,
                    hasta: filterHasta
                }
            });
            const sorted=res.data.data?.sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)) || [];
            setExpenses(sorted);
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
            const data=res.data.map((item,index)=>({
                categoria: item._id,
                total: item.total,
                color: COLORS[index % COLORS.length],
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
    },[filterCategoria, filterDesde, filterHasta]);

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
        <div style={{maxWidth:'900px', margin:'0 auto', fontFamily:'Arial, sans-serif'}}>
            <h2 style={{textAlign:'center'}}>Gestion de gastos</h2>

            <form onSubmit={handleSubmit} encType="multipart/form-data" style={{display: 'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap'}}>
                <input 
                    placeholder="Descripcion"
                    value={description}
                    required
                    onChange={(e)=>setDescription(e.target.value)}
                    style={{flex:'1 1 200px', padding:'8px'}}
                />

                <select
                    value={categoria}
                    required
                    onChange={(e)=>setCategoria(e.target.value)}
                    style={{flex: '1 1 150px', padding:'8px'}}
                >
                    <option value="">Seleccionar categoria</option>
                    <option value="Varios">Varios</option>
                    <option value="Limpieza">Limpieza</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Cigarrillos">Cigarrillos</option>
                    <option value="Otros">Otros</option>
                </select>

                <input 
                    type="number"
                    placeholder="Monto"
                    value={amount}
                    required
                    onChange={(e)=>setAmount(Number(e.target.value))}
                    style={{flex: '1 1 150px'}}
                />

                <input 
                    type="file" 
                    onChange={(e)=>{
                        const file=e.target.files[0];
                        if(!file)return;

                        const validTypes=['image/jpeg','image/jpg','image/png','application/pdf'];
                        if(!validTypes.includes(file.type)){
                            setFileError('Archivo invalido. Solo JPG, PNG o PDF.');
                            setComprobante(null);
                            setPreview(null);
                            return;
                        }
                        setFileError('');
                        setComprobante(file);

                        if(file.type.startsWith('image/')){
                            const reader=new FileReader();
                            reader.onloadend=()=>setPreview(reader.result);
                            reader.readAsDataURL(file);
                        }else{
                            setPreview(null);
                        }
                    }}
                />
                {fileError && <p style={{color:'red'}}>{fileError}</p>}
                {preview &&(
                    <div style={{marginTop:'10px'}}>
                        <img src={preview} alt="Preview" style={{width:'150px', border:'1px solid #ccc'}}></img>
                    </div>
                )}
                <button type="submit" style={{padding:'8px 16px', backgroundColor: '#4CAF50', color:'white', border:'none', cursor:'pointer'}}>
                    {editingId ? "Actualizar":"Agregar"}
                </button>
            </form>
            
            <div style={{marginBottom:'20px'}}>
                <label>Filtrar por categoria</label>
                <select
                    value={filterCategoria}
                    onChange={(e)=>{setFilterCategoria(e.target.value); fetchExpenses(1);}}
                >
                    <option value="">Todas</option>
                    <option value="Varios">Varios</option>
                    <option value="Limpieza">Limpieza</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Cigarrillos">Cigarrillos</option>
                    <option value="Otros">Otros</option>
                </select>
                <input 
                    type="date"
                    value={filterDesde}
                    onChange={(e)=>setFilterDesde(e.target.value)}
                />
                <input 
                    type="date"
                    value={filterHasta}
                    onChange={(e)=>setFilterHasta(e.target.value)}
                />
            </div>

            <h3>Total de gastos:{formatCurrency(total)}</h3>

            <h3>Gastos por categoria</h3>
            <div style={{display:'flex', gap:'2rem', flexWrap:'wrap'}}>
                <ResponsiveContainer width="60%" height={300}>
                    <BarChart data={categoryData}>
                        <XAxis dataKey="categoria" />
                        <YAxis />
                        <Tooltip formatter={(value)=>formatCurrency(value)} />
                        <Bar dataKey="total">
                            {categoryData.map((entry, index)=>{
                                return <Cell key={`cell-${index}`} fill={entry.color} />
                            })}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="35%" height={300}>
                    <PieChart>
                        <Pie
                            data={categoryData}
                            dataKey="total"
                            nameKey="categoria"
                            outerRadius={100}
                            label={(entry) => entry.categoria}
                        >
                            {categoryData.map((entry, index) => (
                                <Cell key={`pie-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Legend />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                </ResponsiveContainer>

            </div>

            <h2>Lista de gastos</h2>
            <table border="1" style={{width:'100%', borderCollapse:'collapse', marginTop:'10px'}}>
                <thead>
                    <tr style={{backgroundColor:'#f2f2f2'}}>
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
                        <tr 
                            key={expense._id}
                            style={{backgroundColor:expense.monto>50000 ? '#ffe0e0' : 'transparent'}}
                        >
                            <td>{expense.description}</td>
                            <td>{expense.categoria}</td>
                            <td>{formatCurrency(expense.monto)}</td>
                            <td>{new Date(expense.fecha).toLocaleString()}</td>
                            <td>
                                {expense.comprobante ? (
                                    <>
                                        <span>{expense.comprobante.split('.').pop().toUpperCase()}</span>{" "}
                                        <a
                                            href={`http://localhost:3000/uploads/${expense.comprobante}`} 
                                            download={expense.comprobante}
                                        >
                                            Descargar
                                        </a>
                                    </>
                                ) : (
                                    'Sin comprobante'
                                )}
                            </td>
                            <td>
                                <button onClick={()=>handleEdit(expense)} style={{marginRight:'5px', padding: '4px 8px'}}>Editar</button>
                                <button onClick={()=>handleDelete(expense._id)} style={{padding: '4px 8px'}}>Eliminar</button>
                            </td>
                        </tr> 
                    ))}
                </tbody>
            </table>
            <div style={{marginTop:'10px', display:'flex', justifyContent:'center', gap:'10px'}}>
                <button disabled={page===1} onClick={()=>fetchExpenses(page-1)}>Anterior</button>
                <span>Pagina {page} de {totalPages}</span>
                <button disabled={page===totalPages} onClick={()=>fetchExpenses(page+1)}>Siguiente</button>
            </div>
        </div>
    );
}

export default Expenses;