const express = require('express');
const router = express.Router();
const mysql = require("mysql2");

// Suponiendo que ya tienes la conexión a la base de datos establecida en server.js
const db = require('./db'); // Importa tu conexión a la base de datos

// Ruta para agregar un detalle de pedido
router.post('/', (req, res) => {
    const { pedido_id, producto_id, cantidad, precio } = req.body;
    const query = "INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?)";

    db.query(query, [pedido_id, producto_id, cantidad, precio], (err, results) => {
        if (err) {
            console.error("Error al agregar detalle de pedido:", err);
            return res.status(500).json({ success: false, message: "Error en el servidor" });
        }
        res.json({ success: true, message: "Detalle de pedido agregado correctamente" });
    });
});

// ... Agrega más rutas según sea necesario (por ejemplo, para obtener detalles de un pedido)

module.exports = router;
