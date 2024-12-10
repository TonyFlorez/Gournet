const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

// Configura la conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Tu usuario de MySQL
    password: '', // Tu contraseña de MySQL
    database: 'empleados' // Tu base de datos
});

// Conecta a la base de datos
connection.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos MySQL:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Crear un nuevo pedido
router.post('/', (req, res) => {
    const { cliente_id, total, detalles } = req.body;

    // Verificar que los datos necesarios estén presentes
    if (!cliente_id || !total || !Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Insertar el pedido
    const sql = 'INSERT INTO pedidos (cliente_id, total) VALUES (?, ?)';
    connection.query(sql, [cliente_id, total], (err, result) => {
        if (err) {
            console.error('Error al insertar el pedido:', err);
            return res.status(500).json({ error: 'Error al crear el pedido' });
        }

        const pedidoId = result.insertId;

        // Insertar detalles del pedido
        const detallesSql = 'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio) VALUES ?';
        const detallesValues = detalles.map(detalle => [pedidoId, detalle.producto_id, detalle.cantidad, detalle.precio]);

        connection.query(detallesSql, [detallesValues], (err) => {
            if (err) {
                console.error('Error al insertar los detalles del pedido:', err);
                return res.status(500).json({ error: 'Error al crear los detalles del pedido' });
            }

            res.status(201).json({ message: 'Pedido creado con éxito', pedidoId });
        });
    });
});

// Listar todos los pedidos
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM pedidos';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener los pedidos:', err);
            return res.status(500).json({ error: 'Error al obtener los pedidos' });
        }

        res.status(200).json(results);
    });
});

// Actualizar un pedido
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { estado, total } = req.body;

    const sql = 'UPDATE pedidos SET estado = ?, total = ? WHERE id = ?';
    connection.query(sql, [estado, total, id], (err) => {
        if (err) {
            console.error('Error al actualizar el pedido:', err);
            return res.status(500).json({ error: 'Error al actualizar el pedido' });
        }

        res.status(200).json({ message: 'Pedido actualizado con éxito' });
    });
});

// Eliminar un pedido
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM pedidos WHERE id = ?';
    connection.query(sql, [id], (err) => {
        if (err) {
            console.error('Error al eliminar el pedido:', err);
            return res.status(500).json({ error: 'Error al eliminar el pedido' });
        }

        res.status(200).json({ message: 'Pedido eliminado con éxito' });
    });
});

module.exports = router;
