const express = require('express');
const router = express.Router();
const db = require('./db'); // Importa la conexión a la base de datos desde db.js

// Rutas de productos
router.get('/', (req, res) => {
    const query = "SELECT * FROM productos";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error en el servidor" });
        }
        res.json({ success: true, productos: results });
    });
});

// Agregar producto
router.post('/', (req, res) => {
    const { nombre, descripcion, precio, stock, categoria } = req.body;
    const query = "INSERT INTO productos (nombre, descripcion, precio, stock, categoria) VALUES (?, ?, ?, ?, ?)";

    db.query(query, [nombre, descripcion, precio, stock, categoria], (err) => {
        if (err) {
            console.error("Error al agregar producto:", err);
            return res.status(500).json({ success: false, message: "Error en el servidor" });
        }
        res.json({ success: true, message: "Producto agregado correctamente" });
    });
});

// Actualizar producto
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, categoria, estado } = req.body;
    const query = "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ?, estado = ? WHERE id = ?";

    db.query(query, [nombre, descripcion, precio, stock, categoria, estado, id], (err) => {
        if (err) {
            console.error("Error al actualizar producto:", err);
            return res.status(500).json({ success: false, message: "Error en el servidor" });
        }
        res.json({ success: true, message: "Producto actualizado correctamente" });
    });
});

// Eliminar producto
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM productos WHERE id = ?";

    db.query(query, [id], (err) => {
        if (err) {
            console.error("Error al eliminar producto:", err);
            return res.status(500).json({ success: false, message: "Error en el servidor" });
        }
        res.json({ success: true, message: "Producto eliminado correctamente" });
    });
});

module.exports = router;
