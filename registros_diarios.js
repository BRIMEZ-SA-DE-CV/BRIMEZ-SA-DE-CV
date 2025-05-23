// registros_diarios.js - Gestión de registros diarios de empleados

// Función para inicializar la colección de registros diarios
function inicializarRegistrosDiarios() {
  console.log("Inicializando sistema de registros diarios...");
  
  // Verificar si existe la colección en Firebase
  db.collection("registros_diarios").get()
    .then((snapshot) => {
      if (snapshot.empty) {
        console.log("No hay registros diarios en la base de datos. La colección está lista para usar.");
      } else {
        console.log("Registros diarios cargados desde Firebase");
      }
    })
    .catch((error) => {
      console.error("Error al inicializar registros diarios:", error);
      alert("Error al cargar registros diarios: " + error.message);
    });
}

// Función para crear o actualizar el registro diario de un empleado
function registrarJornadaDiaria(idEmpleado, nombre, fecha, horaEntrada, horaSalida) {
  // Crear ID único para el registro diario (combinación de ID empleado y fecha)
  const fechaFormateada = new Date(fecha).toISOString().split('T')[0]; // Formato YYYY-MM-DD
  const registroId = `${idEmpleado}_${fechaFormateada}`;
  
  // Crear objeto con los datos del registro
  const registroDiario = {
    id: idEmpleado,
    nombre: nombre,
    fecha: fechaFormateada,
    horaEntrada: horaEntrada || null,
    horaSalida: horaSalida || null,
    ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  // Verificar si ya existe un registro para este empleado en esta fecha
  db.collection("registros_diarios").doc(registroId).get()
    .then((doc) => {
      if (doc.exists) {
        // Actualizar solo los campos proporcionados
        const datosActualizados = {};
        if (horaEntrada) datosActualizados.horaEntrada = horaEntrada;
        if (horaSalida) datosActualizados.horaSalida = horaSalida;
        datosActualizados.ultimaActualizacion = firebase.firestore.FieldValue.serverTimestamp();
        
        // Actualizar registro existente
        return db.collection("registros_diarios").doc(registroId).update(datosActualizados);
      } else {
        // Crear nuevo registro
        return db.collection("registros_diarios").doc(registroId).set(registroDiario);
      }
    })
    .then(() => {
      console.log(`Registro diario para ${nombre} (${idEmpleado}) actualizado correctamente`);
    })
    .catch((error) => {
      console.error("Error al guardar registro diario:", error);
    });
}

// Función para obtener todos los registros diarios de un empleado
function obtenerRegistrosDiariosEmpleado(idEmpleado) {
  return new Promise((resolve, reject) => {
    db.collection("registros_diarios")
      .where("id", "==", idEmpleado)
      .orderBy("fecha", "desc")
      .get()
      .then((snapshot) => {
        const registros = [];
        snapshot.forEach((doc) => {
          registros.push(doc.data());
        });
        resolve(registros);
      })
      .catch((error) => {
        console.error("Error al obtener registros diarios:", error);
        reject(error);
      });
  });
}

// Función para obtener todos los registros diarios de una fecha específica
function obtenerRegistrosPorFecha(fecha) {
  const fechaFormateada = new Date(fecha).toISOString().split('T')[0]; // Formato YYYY-MM-DD
  
  return new Promise((resolve, reject) => {
    db.collection("registros_diarios")
      .where("fecha", "==", fechaFormateada)
      .orderBy("id", "asc")
      .get()
      .then((snapshot) => {
        const registros = [];
        snapshot.forEach((doc) => {
          registros.push(doc.data());
        });
        resolve(registros);
      })
      .catch((error) => {
        console.error("Error al obtener registros por fecha:", error);
        reject(error);
      });
  });
}

// Función para actualizar el registro diario cuando se registra una entrada
function registrarEntradaDiaria(idEmpleado, nombre) {
  const ahora = new Date();
  const fechaHoy = ahora.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  const horaActual = ahora.toLocaleTimeString('es-ES');
  
  registrarJornadaDiaria(idEmpleado, nombre, fechaHoy, horaActual, null);
}

// Función para actualizar el registro diario cuando se registra una salida
function registrarSalidaDiaria(idEmpleado, nombre) {
  const ahora = new Date();
  const fechaHoy = ahora.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  const horaActual = ahora.toLocaleTimeString('es-ES');
  
  // Obtener el registro de hoy para mantener la hora de entrada
  const registroId = `${idEmpleado}_${fechaHoy}`;
  
  db.collection("registros_diarios").doc(registroId).get()
    .then((doc) => {
      if (doc.exists) {
        const datos = doc.data();
        registrarJornadaDiaria(idEmpleado, nombre, fechaHoy, datos.horaEntrada, horaActual);
      } else {
        // Si no existe un registro previo, crear uno nuevo solo con la salida
        registrarJornadaDiaria(idEmpleado, nombre, fechaHoy, null, horaActual);
      }
    })
    .catch((error) => {
      console.error("Error al registrar salida diaria:", error);
    });
}

// Exportar funciones para uso en otros archivos
window.registrosDiarios = {
  inicializar: inicializarRegistrosDiarios,
  registrarJornada: registrarJornadaDiaria,
  registrarEntrada: registrarEntradaDiaria,
  registrarSalida: registrarSalidaDiaria,
  obtenerPorEmpleado: obtenerRegistrosDiariosEmpleado,
  obtenerPorFecha: obtenerRegistrosPorFecha
};

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', inicializarRegistrosDiarios);