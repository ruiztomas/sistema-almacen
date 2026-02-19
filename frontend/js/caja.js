const API='http://IP-SERVIDOR:3000/api';
const token=localStorage.getItem('token');

if(!token){
    window.location.href='login.html';
}

let productos=[];
let venta=[];

const totalSpan=document.getElementById('total');
const tabla=document.getElementById('tablaVenta');

fetch(`${API}/products`)
    .then(res=>res.json())
    .then(data=>productos=data);

fetch(`${API}/products/alerts/low-stock`)
    .then(res=>res.json())
    .then(data=>{
        const ul=document.getElementById('alertas');
        ul.innerHTML='';

        data.forEach(p=>{
            ul.innerText+=`
                <li>
                    ${p.nombre}-
                    ${
                        p.tipoVenta==='unidad'
                        ?`Stock: ${p.stock}`
                        :`Stock: ${p.stockKg}kg`
                    }
                </li>
            `;
        });
    });

fetch(`${API}/clients`)
    .then(res=>res.json())
    .then(clientes=>{
        const select=document.getElementById('cliente');
        clientes.forEach(c=>{
            const opt=document.getElementById('option');
            opt.value=c._id;
            opt.textContent=`${c.nombre}($${c.saldoFiado})`;
            select.appendChild(opt);
        });
    });

function agregarProducto(producto, cantidad){
    const subtotal=cantidad*(
        producto.tipoVenta==='unidad'
            ?producto.precioUnitario
            :producto.precioKg
    );
    venta.push({
        producto: producto._id,
        cantidad,
        precio: producto.tipoVenta==='unidad'
            ?producto.precioUnitario
            :producto.precioKg,
        subtotal
    });
    render();
}

function render(){
    tabla.innerHTML='';
    let total=0;

    venta.forEach((item, i)=>{
        total+=item.subtotal;
        tabla.innerHTML+=`
            <tr>
                <td>${item.producto}</td>
                <td>${item.cantidad}</td>
                <td>${item.precio}</td>
                <td>${item.subtotal}</td>
                <td><button onclick="eliminar(${i})">X</button></td>
            </tr>
        `;
    });
    totalSpan.textContent=total;
}

function eliminar(i){
    venta.splice(i, 1);
    render();
}

document.getElementById('finalizar').onclick=()=>{
    fetch(`${API}/sales`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
            items: venta,
            fiado: document.getElementById('fiado').checked,
            clienteId: document.getElementById('cliente').value,
            pago: 'efectivo'
        })
    })
    .then(()=>{
        venta=[];
        render();
        alert('Venta registrada');
    });
};

document.getElementById('verCierre').onclick=()=>{
    fetch(`${API}/sales/daily-summary`)
        .then(res=>res.json())
        .then(data=>{
            document.getElementById('cierre').innerHTML=`
                <p>Ventas: ${data.ventas}</p>
                <p>Total vendido: $${data.totalVendido}</p>
                <p>Total fiado: $${data.totalFiado}</p>
                <p>Total cobrado: $${data.totalCobrado}</p>
            `;
        });
};