const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

// Middleware para procesar JSON y habilitar CORS
app.use(cors());
app.use(express.json());

// Configuración de la conexión a MySQL
const connection = mysql.createConnection({
  host: 'localhost',      // Servidor MySQL (local)
  user: 'root',           // Usuario de MySQL (normalmente root para desarrollo)
  password: 'Aruiz4161', // IMPORTANTE: Cambia esto por tu contraseña real
  database: 'basedatos'     // Nombre de la base de datos que creaste
});

// Conectar a MySQL
connection.connect(err => {
  if (err) {
    console.error('Error al conectar a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL correctamente');
});

// ENDPOINT 1: Obtener todos los usuarios
app.get('/usuarios', (req, res) => {
  // Ejecuta una consulta SQL para seleccionar todos los usuarios
  connection.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Devuelve los resultados como JSON
    res.json(results);
  });
});

// ENDPOINT 2: Agregar nuevo usuario
app.post('/usuarios', (req, res) => {
  // Extrae los datos del cuerpo de la petición
  const { nombre, apellido, email, puesto } = req.body;
  
  // Ejecuta una consulta SQL para insertar un nuevo usuario
  connection.query(
    'INSERT INTO usuarios (nombre, apellido, email, puesto) VALUES (?, ?, ?, ?)',
    [nombre, apellido, email, puesto], // Parámetros para prevenir inyección SQL
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      // Devuelve el ID del nuevo usuario
      res.json({ id: results.insertId });
    }
  );
});

// ENDPOINT 3: Editar usuario existente
app.put('/usuarios/:id', (req, res) => {
  // Extrae los datos del cuerpo de la petición
  const { nombre, apellido, email, puesto } = req.body;
  
  // Ejecuta una consulta SQL para actualizar un usuario
  connection.query(
    'UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, puesto = ? WHERE id = ?',
    [nombre, apellido, email, puesto, req.params.id], // El último parámetro es el ID de la URL
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      // Devuelve el número de filas afectadas
      res.json({ updated: results.affectedRows });
    }
  );
});

// ENDPOINT 4: Eliminar usuario
app.delete('/usuarios/:id', (req, res) => {
  // Ejecuta una consulta SQL para eliminar un usuario
  connection.query(
    'DELETE FROM usuarios WHERE id = ?',
    [req.params.id], // ID del usuario a eliminar
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      // Devuelve el número de filas eliminadas
      res.json({ deleted: results.affectedRows });
    }
  );
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});