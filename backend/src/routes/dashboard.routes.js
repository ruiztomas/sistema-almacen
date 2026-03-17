const express = require('express');
const router = express.Router();

const Expense = require('../models/Expense');
const Product = require("../models/Product");
const Sale = require('../models/Sale');
const CashRegister = require("../models/CashRegister");

const { auth } = require('../middleware/auth.middleware');

router.get('/', auth, async (req, res, next) => {
    try {

        let match = {};
        if (req.user.role !== 'admin') {
            match.user = req.user.id;
        }

        // 💸 GASTOS
        const totalResult = await Expense.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$monto" }
                }
            }
        ]);

        // 📅 HOY
        const hoy = new Date();

        const inicio = new Date(hoy);
        inicio.setHours(0, 0, 0, 0);

        const fin = new Date(hoy);
        fin.setHours(23, 59, 59, 999);

        const ventasHoy = await Sale.find({
            createdAt: { $gte: inicio, $lte: fin }
        });

        let totalVentas = 0;
        let costoProducto = 0;

        ventasHoy.forEach(v => {
            totalVentas += v.total;

            v.items.forEach(item => {
                costoProducto += item.cantidad * (item.precioCosto || 0);
            });
        });

        const gananciaHoy = totalVentas - costoProducto;

        // 📦 INVENTARIO
        const products = await Product.find({ activo: true });

        let valorInventario = 0;
        let productosStockBajo = 0;
        let dineroReposicion = 0;

        let alertas = [];

        products.forEach(p => {
            const stockActual = p.tipoVenta === "unidad" ? p.stock : p.stockKg;

            valorInventario += stockActual * (p.precioCosto || 0);

            if (stockActual <= p.stockMinimo) {
                productosStockBajo++;

                const cantidadComprar = (p.stockMinimo * 2) - stockActual;

                dineroReposicion += cantidadComprar * (p.precioCosto || 0);

                // 🚨 ALERTA
                alertas.push({
                    tipo: "stock",
                    mensaje: `Stock bajo: ${p.nombre}`
                });
            }
        });

        // 🏆 TOP PRODUCTOS
        const topProductos = {};

        ventasHoy.forEach(v => {
            v.items.forEach(item => {
                if (!topProductos[item.producto]) {
                    topProductos[item.producto] = 0;
                }
                topProductos[item.producto] += item.cantidad;
            });
        });

        const ranking = Object.entries(topProductos)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // 💰 CAJA
        const caja = await CashRegister.findOne({ abierta: true });

        let cajaInfo = {
            abierta: false
        };

        if (caja) {
            const diferencia =
                (caja.montoInicial + caja.ventasEfectivo) -
                (caja.gastos || 0);

            cajaInfo = {
                abierta: true,
                montoInicial: caja.montoInicial,
                ventasEfectivo: caja.ventasEfectivo,
                gastos: caja.gastos,
                diferencia
            };

            // 🚨 ALERTA CAJA
            if (diferencia < 0) {
                alertas.push({
                    tipo: "caja",
                    mensaje: "Caja en negativo"
                });
            }
        } else {
            alertas.push({
                tipo: "caja",
                mensaje: "No hay caja abierta"
            });
        }

        // 🚀 RESPUESTA FINAL (OPTIMIZADA PARA TU FRONT)
        res.json({
            ventasHoy: totalVentas,
            gananciaHoy,
            valorInventario,
            productosStockBajo,
            dineroReposicion,
            gastosTotales: totalResult[0]?.total || 0,
            topProductos: ranking,
            caja: cajaInfo,
            alertas
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;