import {useState} from 'react';
import { useNavigate } from 'react-router-dom'; 
import api from '../api/axios';

function Login(){
    const [username, setUsername]=useState('');
    const [password, setPassword]=useState('');
    const [error, setError]=useState('');
    const navigate=useNavigate();

    const handleLogin=async(e)=>{
        e.preventDefault();

        try{
            const res=await api.post('/auth/login',{
                username,
                password
            });
            localStorage.setItem('token', res.data.token);
            navigate('/dashboard',{replace:true});
        }catch(err){
            console.error(err);
            alert('Error al iniciar sesion');
        }
    };
    return(
        <div style={{maxWidth:"400px", margin:"50px auto"}}>
            <h2>Login</h2>
            <form onSubmit={handleLogin} style={{display:"flex", flexDirection:"column", gap:"10px"}}>
                <input
                    placeholder='Usuario'
                    value={username}
                    onChange={(e)=>setUsername(e.target.value)}
                    required
                />
                <input
                    type='password'
                    placeholder='Contraseña'
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    aria-required
                />
                <button type='submit'>Ingresar</button>
                {error && <p style={{color:"red"}}>{error}</p>}
            </form>
        </div>
    );
}

export default Login;