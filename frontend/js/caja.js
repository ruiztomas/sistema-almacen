const API='http://IP-SERVIDOR:3000/api';

const token=localStorage.getItem('token');
const role=localStorage.getItem('role');

if(!token){
    window.location.href='login.html';
}

if(role!=='admin'){
    document.getElementById('btnGastos').style.display='none';
    document.getElementById('btnResumen').style.display='none';
}

let productos=[];
let venta=[];

const totalSpan=document.getElementById('total');
const tabla=document.getElementById('tablaVenta');

//CARGAR PRODUCTOS
fetch(`${API}/products`,{
    headers:{'Authorization':'Bearer ' +token}
})
.then(res=>res.json())
.then(data=>productos=data);

//LOGICA BUSCADOR
const inputBuscar = document.getElementById('buscar');
const sugerenciasDiv = document.getElementById('sugerencias');

inputBuscar.addEventListener('input', () => {

    const texto = inputBuscar.value.toLowerCase();
    sugerenciasDiv.innerHTML = '';

    if (!texto) return;

    const filtrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(texto)
    );

    filtrados.slice(0, 8).forEach(producto => {

        const div = document.createElement('div');

        div.textContent = `${producto.nombre} - $${ 
            producto.tipoVenta === 'unidad'
                ? producto.precioUnitario
                : producto.precioKg + '/kg'
        }`;

        div.onclick = () => {

            let cantidad = 1;

            if (producto.tipoVenta === 'peso') {
                cantidad = parseFloat(prompt('Ingrese cantidad en kg:'));
                if (!cantidad) return;
            }

            agregarProducto(producto, cantidad);

            sugerenciasDiv.innerHTML = '';
            inputBuscar.value = '';
        };

        sugerenciasDiv.appendChild(div);
    });
});
inputBuscar.addEventListener('keydown', (e) => {

    if (e.key === 'Enter') {

        const primera = sugerenciasDiv.firstChild;
        if (primera) {
            primera.click();
        }
    }
});

//ALERTA DE STOCK BAJO
fetch(`${API}/products/alerts/low-stock`,{
    headers:{'Authorization':'Bearer ' +token}
})
.then(res=>res.json())
.then(data=>{
    const ul=document.getElementById('alertas');
    ul.innerHTML='';

    data.forEach(p=>{
        const li=document.createElement('li');
        li.textContent=`${p.nombre}-${
            p.tipoVenta==='unidad'
                ?`Stock: ${p.stock}`
                :`Stock: ${p-stockKg}kg`
        }`;
        ul.appendChild(li);
    });
});

//CLIENTES
fetch(`${API}/clients`,{
    headers:{'Authorization':'Bearer ' +token}
})
.then(res=>res.json())
.then(clientes=>{
    const select=document.getElementById('cliente');
    clientes.forEach(c=>{
        const opt=document.getElement('option');
        opt.value=c._id;
        opt.textContent=`${c.nombre}($${c.saldoFiado})`;
        select.appendChild(opt);
    });
});

//AGREGAR PRODUCTO
function agregarProducto(producto, cantidad){
    const precio=producto.tipoVenta==='unidad'
            ?producto.precioUnitario
            :producto.precioKg;
    const subtotal=cantidad*precio;
    venta.push({
        productoId: producto._id,
        nombre:producto.nombre,
        cantidad,
        precio,
        subtotal
    });
    render();
}

//RENDER TABLA
function render(){
    tabla.innerHTML='';
    let total=0;

    venta.forEach((item, i)=>{
        total+=item.subtotal;
        tabla.innerHTML+=`
            <tr>
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>${item.precio}</td>
                <td>${item.subtotal}</td>
                <td>
                    <button onclick="eliminar(${i})">
                        X
                    </button>
                </td>
            </tr>
        `;
    });
    totalSpan.textContent=total;
}

//ELIMINAR ITEM
function eliminar(i){
    venta.splice(i, 1);
    render();
}

//FINALIZAR VENTA
document.getElementById('finalizar').onclick=()=>{
    if(venta.length===0){
        alert('No hay productos en stock');
        return;
    }
    fetch(`${API}/sales`,{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
            'Authorization': 'Bearer ' +token
        },
        body:JSON.stringify({
            items: venta.map(v=>({
                producto:v.productoId,
                cantidad:v.cantidad,
                precio:v.precio,
                subtotal:v.subtotal
            })),
            fiado: document.getElementById('fiado').checked,
            clienteId: document.getElementById('cliente').value,
            pago: 'efectivo'
        })
    })
    .then(res=>res.json())
    .then(()=>{
        venta=[];
        render();
        alert('Venta registrada');
    });
};

//CIERRE DE CAJA
document.getElementById('verCierre').onclick=()=>{
    fetch(`${API}/sales/daily-summary`,{
        headers:{'Authorization':'Bearer ' +token}
    })
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

//LOGOUT
document.getElementById('logout').onclick=()=>{
    localStorage.clear();
    window.location.href='login.html';
};

//CREAR GRAFICO
function cargarGrafico() {

    fetch(`${API}/sales/hourly-summary`, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(data => {

        const horas = data.map(d => d._id + " hs");
        const totales = data.map(d => d.total);

        const ctx = document.getElementById('graficoVentas');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: horas,
                datasets: [{
                    label: 'Ventas por hora',
                    data: totales
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });

    });
}

cargarGrafico();