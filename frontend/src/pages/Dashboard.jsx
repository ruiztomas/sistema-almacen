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

  if (loading) {
    return (
      <p style={{ textAlign: "center", marginTop: "40px" }}>
        Cargando dashboard...
      </p>
    );
  }

  if (error) {
    return (
      <p style={{ textAlign: "center", marginTop: "40px", color: "red" }}>
        {error}
      </p>
    );
  }

  const cards = [
    { title: "Ventas hoy", value: `$${data.ventasHoy || 0}` },
    { title: "Ganancia hoy", value: `$${data.gananciaHoy || 0}` },
    { title: "Valor inventario", value: `$${data.valorInventario || 0}` },
    { title: "Stock bajo", value: data.productosStockBajo || 0 },
    { title: "Reposición necesaria", value: `$${data.dineroReposicion || 0}` },
    { title: "Gastos totales", value: `$${data.gastosTotales || 0}` },
  ];

  const cardStyle = {
    flex: "1 1 200px",
    background: "#1e293b",
    color: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  };

  const panelStyle = {
    flex: 1,
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  };

  const btn = {
    display: "block",
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
  };

  return (
    <div style={{ padding: "20px" }}>

      <h1 style={{ marginBottom: "30px" }}>
        Sistema de Gestión
      </h1>

      {/* TARJETAS DE ESTADISTICAS */}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {cards.map((card, i) => (
          <div key={i} style={cardStyle}>
            <h3>{card.title}</h3>
            <p style={{ fontSize: "22px", fontWeight: "bold" }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* ACCIONES RAPIDAS + ALERTAS */}

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "30px",
        }}
      >

        <div style={panelStyle}>
          <h3>Acciones rápidas</h3>

          <button style={btn}>Nueva venta</button>
          <button style={btn}>Gestionar inventario</button>
          <button style={btn}>Ver reportes</button>
        </div>

        <div style={panelStyle}>
          <h3>Alertas del sistema</h3>

          <p>Ventas hoy: ${data.ventasHoy}</p>

          <p>
            Productos con stock bajo: {data.productosStockBajo}
          </p>

          {data.productosStockBajo === 0 && (
            <p style={{ color: "green" }}>
              ✔ Todo en orden
            </p>
          )}

          {data.topProductos && data.topProductos.length > 0 && (
            <>
              <h4 style={{ marginTop: "10px" }}>
                Productos más vendidos hoy
              </h4>

              <ul>
                {data.topProductos.map((p, i) => (
                  <li key={i}>
                    Producto {p[0]} - {p[1]} vendidos
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* MODULOS DEL SISTEMA */}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >

        <div style={panelStyle}>
          <h2>Gastos</h2>
          <Expenses />
        </div>

        <div style={panelStyle}>
          <h2>Clientes / Fiados</h2>
          <Clients />
        </div>

        <div style={panelStyle}>
          <h2>Productos</h2>
          <Products />
        </div>

        <div style={panelStyle}>
          <h2>Ventas</h2>
          <Sales />
        </div>

      </div>

      <div ref={scrollRef}></div>

    </div>
  );
}

export default Dashboard;