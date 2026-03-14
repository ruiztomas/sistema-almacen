import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";

function SidebarLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Gastos", path: "/expenses" },
    { name: "Clientes", path: "/clients" },
    { name: "Productos", path: "/products" },
    { name: "Ventas", path: "/sales" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      
      <div
        style={{
          width: collapsed ? "60px" : "200px",
          backgroundColor: "#1e1e2f",
          color: "white",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.2s",
        }}
      >
        <button
          onClick={toggleSidebar}
          style={{
            background: "none",
            border: "none",
            color: "white",
            padding: "10px",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {collapsed ? "☰" : "Menu"}
        </button>

        <nav style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                padding: "10px",
                textDecoration: "none",
                color: "white",
                backgroundColor: isActive ? "#4CAF50" : "transparent",
                borderRadius: "4px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              })}
            >
              {collapsed ? item.name.charAt(0) : item.name}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: "auto", padding: "10px" }}>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "#ff4d4f",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            Salir
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: "20px", overflowY: "auto", backgroundColor: "#f5f5f5" }}>
        <Outlet />
      </div>
    </div>
  );
}

export default SidebarLayout;