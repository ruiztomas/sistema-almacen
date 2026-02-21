const API='http://IP-SERVIDOR:3000/api';

function cargarGastos(){
    fetch(`${API}/expenses`)
        .then(res=>res.json())
        .then(data=>{
            const lista=document.getElementById('listaGastos');
            lista.innerHTML='';

            data.forEach(g=>{
                lista.innerHTML+=`
                    <li>
                        ${new Date(g.fecha).toLocaleDateString()}-
                        ${g.descripcion}-
                        $${g.monto}
                    </li>
                `;
            });
        });
}

document.getElementById('guardar').onclick=()=>{
    fetch(`${API}/expenses`,{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
            'Authorization':'Bearer'+token
        },
        body: JSON.stringify({
            descripcion: document.getElementById('descripcion').value,
            categoria:document.getEelementById('categoria').value,
            monto: Number(document.getElementById('monto').value)
        })
    })
    .then(()=>{
        cargarGastos();
    });
};

cargarGastos();