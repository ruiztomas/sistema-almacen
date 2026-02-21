const API='https://IP-SERVIDOR:3000/api';
const tabla=document.getElementById('tablaClientes');
const token = localStorage.getItem('token');

if (!token) {
  window.location.href = 'login.html';
}

function cargarClientes(){
    fetch(`${API}/clients`)
        .then(res=>res.json())
        .then(clientes=>{
            tabla.innerHTML='';

            clientes.forEach(c=>{
                tabla.innerHTML+=`
                    <tr>
                        <td>${c.nombre}</td>
                        <td>${c.telefono||'-'}</td>
                        <td>$${c.saldoFiado}</td>
                        <td>
                            <input type="number" id="pago-${c._id}" placeholder="Monto>
                            <button onclick="pagar('${c._id}')">Cobrar</button>
                        </td>
                    </tr>
                `;
            });
        });
}

function pagar(id){
    const monto=Number(document.getElementById(`pago-${id}`).value);
    
    fetch(`${API}/clients/${id}/pago`,{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
            'Authorization':'Bearer'+token
        },
        body: JSON.stringify({monto})
    })
    .then(()=>{
        alert('Pago registrado');
        cargarClientes();
    });
}

cargarClientes();