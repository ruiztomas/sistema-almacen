import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

import Expenses from "./Expenses";
import Clients from "./Clients";
import Products from "./Products";
import Sales from "./Sales";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard");
        setData(res.data);
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) {
          setError("No autorizado. Por favor inicia sesión.");
        } else {
          setError("Error al cargar datos del dashboard.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-700 dark:text-gray-300">
        Cargando dashboard...
      </p>
    );
  if (error)
    return (
      <p className="text-center mt-10 text-red-600 dark:text-red-400">{error}</p>
    );

  const messages = [
    { type: "info", text: `Ventas hoy: $${data.ventasHoy || 0}` },
    { type: "info", text: `Ganancia hoy: ${data.gananciaHoy || 0}` },
    { type: "info", text: `Valor base de inventario: ${data.valorInventario || 0}` },
    { type: "warning", text: `Productos con stock bajo: ${data.productosStockBajo || 0}` },
    { type: "warning", text: `Dinero necesario para reposicion(Aprox.): $${data.dineroReposicion || 0}` },
    { type: "info", text: `Gastos totales: $${data.gastosTotales || 0}` },
  ];

  const fadeInStyle = {
    animation: "fadeIn 0.3s ease-out",
  };

  return (
    <div style={{display:"flex", flexWrap:"wrap", gap:"20px"}}>
      <h1 className="text-center text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Sistema de Gestion
      </h1>

      <div className="flex-1 overflow-y-auto mb-6 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className="max-w-md p-4 rounded-xl shadow-md bg-white dark:bg-gray-800 dark:text-white"
            style={fadeInStyle}
          >
            {msg.text}
          </div>
        ))}

        {data.topProductos && data.topProductos.length>0 &&(
          <div
            className="max-w-md p-4 rounded-x1 shadow-md bg-orange-50 dark:bg-orange-900"
            style={fadeInStyle}
          >
            <h2 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Productos mas vendidos hoy
            </h2>
            <ul className="space-y-1">
              {data.topProductos.map((p,i)=>(
                <li key={i}>
                  Producto {p[0]}-{p[1]} vendidos
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="space-y-4 mt-4">
          <div
            className="max-w-md p-4 rounded-xl shadows-md bg-blue-50 dark:bg-blue-900"
            style={fadeInStyle}
          >
            <h2 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Gastos
            </h2>
            <Expenses/>
          </div>
          <div
            className="max-w-md p-4 rounded-xl shadow-md bg-green-50 dark:bg-green-900"
            style={fadeInStyle}
          >
            <h2 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Clientes / Fiados
            </h2>
            <Clients/>
          </div>
          <div
            className="max-w-md p-4 rounded-xl shadow-md bg-yellow-50 dark:bg-yellow-900"
            style={fadeInStyle}
          >
            <h2 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Productos
            </h2>
            <Products/>
          </div>
          <div
            className="max-w-md p-4 rounded-xl shadow-md bg-purple-50 dark:bg-purple-900"
            style={fadeInStyle}
          >
            <h2 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Ventas
            </h2>
            <Sales/>
          </div>
        </div>
        <div ref={scrollRef}></div>
      </div>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity:0; transform:translateY(10px); }
            to { opacity:1; transform:translateY(0); }
          }
        `}
      </style>
    </div>
  );
}

export default Dashboard;