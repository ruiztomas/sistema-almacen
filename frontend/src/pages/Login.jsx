import {useState} from 'react';
import api from '../api/axios';

function Login(){
    const [username, setUsername]=useState('');
    const [password, setPassword]=useState('');

    const handleLogin=async(e)=>{
        e.preventDefault();

        try{
            const res=await api.post('/auth/login',{
                username,
                password
            });
            localStorage.setItem('token', res.data.token);
            alert('Login exitoso');
        }catch(error){
            alert('Error al iniciar sesion');
        }
    };
    return(
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    placeholder='Usuario'
                    value={username}
                    onChange={(e)=>setUsername(e.target.value)}
                />
                <input
                    type='password'
                    placeholder='Contraseña'
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                />
                <button type='submit'>Ingresar</button>
            </form>
        </div>
    );
}

export default Login;