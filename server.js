const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const pedidosRouter = require('./pedidos'); // Rutas para pedidos
const productosRouter = require('./productos'); // Rutas para productos
const detallePedidoRouter = require('./detalle_pedido'); // Rutas para detalles de pedido
const moment = require("moment");


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sirve archivos estáticos desde la carpeta actual
app.use(express.static(path.join(__dirname)));

// Configuramos la conexión a la base de datos
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "empleados" 
});

// Conectamos a la base de datos
db.connect((err) => {
    if (err) {
        console.error("Error al conectar a la base de datos:", err);
    } else {
        console.log("Conexión a la base de datos establecida");
    }
});


// endpoint para registrar nuestras ventas
app.post('/api/ventas', (req, res) => {
    const { fecha, cantidad, total, producto_id } = req.body;
    const query = "INSERT INTO ventas (fecha, cantidad, total, producto_id) VALUES (?, ?, ?, ?)";
    db.query(query, [fecha, cantidad, total, producto_id], (err, result) => {
        if (err) {
            console.error("Error al registrar la venta:", err);
            return res.status(500).json({ success: false, message: "Error al registrar la venta" });
        }
        res.json({ success: true, message: "Venta registrada correctamente" });
    });
});



// Ruta para manejar la generación de informes
app.post('/api/generarInforme', (req, res) => {
    const { tipoInforme, fechaInicio } = req.body;
    console.log("Fecha de inicio recibida:", fechaInicio); // Debug: Ver la fecha recibida
    
    let query;
    if (tipoInforme === 'ventas') {
        // Consulta para ventas utilizando solo la fecha de inicio
        query = `
            SELECT v.id, v.fecha, v.cantidad, v.total, p.nombre AS producto_nombre
            FROM ventas v
            JOIN productos p ON v.producto_id = p.id
            WHERE v.fecha >= ?
        `;
    } else {
        return res.status(400).json({ success: false, message: "Tipo de informe no válido" });
    }

    console.log("Consulta SQL:", query); // Debug: Ver la consulta SQL

    db.query(query, [fechaInicio], (err, results) => {
        if (err) {
            console.error("Error al generar informe:", err);
            res.status(500).json({ success: false, message: "Error en el servidor" });
        } else {
            if (results.length === 0) {
                console.log("No se encontraron resultados para la fecha:", fechaInicio); // Debug: Ver si hay resultados
            }

            // Formateamos las fechas
            results.forEach((row) => {
                row.fecha = moment(row.fecha).format('YYYY-MM-DD');  // Cambia el formato de la fecha
            });
            res.json({ success: true, data: results });
        }
    });
});
// Agregar ventass 
app.post('/api/agregarVenta', (req, res) => {
    const { fecha, cantidad, total, producto_id } = req.body;
    const query = `INSERT INTO ventas (fecha, cantidad, total, producto_id) VALUES (?, ?, ?, ?)`;

    db.query(query, [fecha, cantidad, total, producto_id], (err, result) => {
        if (err) {
            console.error("Error al agregar venta:", err);
            res.status(500).json({ success: false, message: "Error al agregar venta" });
        } else {
            res.json({ success: true, message: "Venta agregada correctamente" });
        }
    });
});



// Ruta para autenticar al usuario (login)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT * FROM user WHERE username = ? AND password = ?";

    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error("Error en la consulta de login:", err);
            return res.status(500).json({ success: false, message: "Error en el servidor" });
        }
        if (results.length > 0) {
            res.json({ success: true, message: "Login exitoso", user: results[0] });
        } else {
            res.status(401).json({ success: false, message: "Credenciales incorrectas" });
        }
    });
});

// Ruta para registrar un nuevo usuario
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;

    const query = "INSERT INTO user (username, password) VALUES (?, ?)";
    db.query(query, [username, password], (err, result) => {
        if (err) {
            console.error("Error en el registro:", err);
            return res.status(500).json({ success: false, message: "Error en el servidor" });
        }
        res.json({ success: true, message: "Usuario registrado exitosamente" });
    });
});

// Rutas para proveedores
app.post('/api/proveedores', (req, res) => {
    const { nombre, telefono, correo, direccion } = req.body;
    const query = "INSERT INTO proveedores (nombre, telefono, correo, direccion) VALUES (?, ?, ?, ?)";
    db.query(query, [nombre, telefono, correo, direccion], (err, result) => {
        if (err) {
            console.error("Error al agregar proveedor:", err);
            res.status(500).json({ success: false, message: "Error en el servidor" });
        } else {
            res.json({ success: true, message: "Proveedor agregado correctamente" });
        }
    });
});

app.get('/api/proveedores', (req, res) => {
    db.query("SELECT * FROM proveedores", (err, results) => {
        if (err) {
            console.error("Error al obtener proveedores:", err);
            res.status(500).json({ success: false, message: "Error en el servidor" });
        } else {
            res.json(results);
        }
    });
});

app.delete('/api/proveedores/:id', (req, res) => {
    const id = req.params.id;
    db.query("DELETE FROM proveedores WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error("Error al eliminar proveedor:", err);
            res.status(500).json({ success: false, message: "Error en el servidor" });
        } else {
            res.json({ success: true, message: "Proveedor eliminado correctamente" });
        }
    });
});

// Integrar los routers de productos, pedidos y detalles de pedido
app.use('/api/productos', productosRouter);
app.use('/api/pedidos', pedidosRouter);
app.use('/api/detalles_pedido', detallePedidoRouter);

// Para iniciar el servidor
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

// Exporta la conexión para que esté disponible en otros archivos
module.exports = db;
