const API='http://IP-SERVIDOR:3000/api';
const tabla=document.getElementById('tablaHistorial').value;
const token = localStorage.getItem('token');

if (!token) {
  window.location.href = 'login.html';
}

document.getElementById('buscar').onclick=()=>{
    const fecha=document.getElementById('fecha').value;
    
    fetch(`${API}/sales/by-date/${fecha}`)
        .then(res=>res.json())
        .then(ventas=>{
            tabla.innerHTML='';

            ventas.forEach(v=>{
                const hora=new Date(v.createdAt).toLocaleTimeString();

                tabla.innerHTML+=`
                    <tr>
                        <td>${hora}</td>
                        <td>${v.cliente?v.cliente.nombre:'-'}</td>
                        <td>4${v.total}</td>
                        <td>${v.fiado?'Si':'No'}</td>
                    </tr>
                `;
            });
        });
};