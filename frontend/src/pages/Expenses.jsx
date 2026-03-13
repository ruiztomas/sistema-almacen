import { useEffect, useState } from "react";
import api from "../api/axios";

function Expenses(){
    const [expenses, setExpenses]=useState([]);
    const [description, setDescription]=useState('');
    const [amount,setAmount]=useState('');

    const fetchExpenses=async()=>{
        try{
            const res=await api.get('/expenses');

            console.log("Respuesta backend:",res.data);

            setExpenses(res.data.data || []);
        }catch(error){
            console.log("ERROR STATUS:", error.response?.status);
            console.log("ERROR DATA:", error.response?.data);
        }
    };

    useEffect(()=>{
        fetchExpenses();
    },[]);

    const handleSubmit=async(e)=>{
        e.preventDefault();

        console.log({
            description,
            amount
        })

        try{
            await api.post('/expenses',{
                description,
                amount
            });

            setDescription('');
            setAmount('');

            fetchExpenses();
        }catch(error){
            console.log(error);
        }
    };

    return(
        <div>
            <h2>Agregar gasto</h2>

            <form onSubmit={handleSubmit}>
                <input 
                    placeholder="Descripcion"
                    value={description}
                    onChange={(e)=>setDescription(e.target.value)}
                />
                <input 
                    type="number"
                    placeholder="Monto"
                    value={amount}
                    onChange={(e)=>setAmount(e.target.value)}
                />

                <button type="submit">Agregar</button>
            </form>

            <h2>Lista de gastos</h2>

            <table border="1">
                <thead>
                    <tr>
                        <th>Descripcion</th>
                        <th>Monto</th>
                        <th>Fecha</th>
                    </tr>
                </thead>

                <tbody>
                    {expenses.map((expense)=>(
                        <tr key={expense._id}>
                            <td>{expense.description}</td>
                            <td>{expense.amount}</td>
                            <td>{new Date(expense.date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}

export default Expenses;