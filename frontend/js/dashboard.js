const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token) {
  window.location.href = 'login.html';
}

if (role !== 'admin') {
  document.getElementById('btnGastos').style.display = 'none';
  document.getElementById('btnResumen').style.display = 'none';
}

function mostrar(id) {
  document.querySelectorAll('.seccion').forEach(sec => {
    sec.classList.add('hidden');
  });

  document.getElementById(id).classList.remove('hidden');
}

function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

async function cargarGrafico() {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = hoy.getMonth() + 1;

  const res = await fetch(`http://IP-SERVIDOR:3000/api/sales/monthly-summary/${year}/${month}`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });

  const data = await res.json();

  const ctx = document.getElementById('graficoVentas');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Ventas', 'Gastos'],
      datasets: [{
        label: 'Resumen mensual',
        data: [data.totalVentas, data.totalGastos]
      }]
    }
  });
}

cargarGrafico();