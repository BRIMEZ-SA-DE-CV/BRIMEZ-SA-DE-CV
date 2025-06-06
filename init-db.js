const sqlite3 = require('sqlite3').verbose();

// Crear una nueva base de datos
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error al abrir la base de datos', err.message);
    return;
  }
  console.log('Base de datos creada correctamente');
  
  // Crear la tabla de usuarios
  db.run(
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      puesto TEXT NOT NULL,
      fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  , (err) => {
    if (err) {
      console.error('Error al crear la tabla', err.message);
      return;
    }
    console.log('Tabla de usuarios creada correctamente');
    
    // Cerrar la conexión
    db.close();
  });
});
