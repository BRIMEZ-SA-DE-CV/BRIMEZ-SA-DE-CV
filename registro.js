import { db } from "./firebase-config.js";
// registro.js - Lógica para registro de entradas y salidas

// Inicializar registros
function inicializarRegistros() {
  // Iniciar el reloj
  iniciarReloj();
  // Cargar registros actuales
  actualizarTablaRegistros();
}

// Función para iniciar el reloj en tiempo real
function iniciarReloj() {
  setInterval(() => {
    const ahora = new Date();
    const elementoReloj = document.getElementById('clock');
    if (elementoReloj) {
      elementoReloj.textContent = ahora.toLocaleTimeString('es-ES');
    }
  }, 1000);
}

// Función para buscar empleado por ID
function buscarEmpleado() {
  const idEmpleado = document.getElementById("idEmpleado").value.trim();
  const nombreDisplay = document.getElementById("nombreEmpleado");
  const horarioInfo = document.getElementById("horarioInfo");
  
  // Limpiar información previa
  nombreDisplay.textContent = "";
  horarioInfo.textContent = "";
  
  if (!idEmpleado) {
    return;
  }
  
  // Mostrar indicador de carga
  nombreDisplay.textContent = "Buscando...";
  
  // Buscar empleado en Firebase
  db.collection("empleados").doc(idEmpleado).get()
    .then((doc) => {
      if (doc.exists) {
        const empleado = doc.data();
        nombreDisplay.textContent = empleado.nombre;
        horarioInfo.textContent = `Horario: ${empleado.horarioEntrada} - ${empleado.horarioSalida} | Comida: ${empleado.comidaInicio} - ${empleado.comidaFin}`;
        
        // Determinar última acción para mostrar el botón correcto
        obtenerUltimaAccion(idEmpleado);
      } else {
        nombreDisplay.textContent = "Empleado no encontrado";
        horarioInfo.textContent = "";
        actualizarBotonRegistro("Entrada"); // Por defecto
      }
    })
    .catch((error) => {
      console.error("Error al buscar empleado:", error);
      nombreDisplay.textContent = "Error al buscar empleado";
      horarioInfo.textContent = "";
    });
}

// Obtener la última acción del empleado (entrada o salida)
function obtenerUltimaAccion(idEmpleado) {
  // Consultar en Firebase la última acción del empleado
  db.collection("registros")
    .where("id", "==", idEmpleado)
    .orderBy("fechaCompleta", "desc")
    .limit(1)
    .get()
    .then((snapshot) => {
      let accion = "Entrada"; // Por defecto, la primera acción es entrada
      
      if (!snapshot.empty) {
        const ultimoRegistro = snapshot.docs[0].data();
        accion = ultimoRegistro.accion === "Entrada" ? "Salida" : "Entrada";
      }
      
      actualizarBotonRegistro(accion);
    })
    .catch((error) => {
      console.error("Error al obtener última acción:", error);
      actualizarBotonRegistro("Entrada"); // Por defecto en caso de error
    });
}

// Actualizar el botón de registro según la acción
function actualizarBotonRegistro(accion) {
  const boton = document.getElementById("btnRegistrar");
  
  if (accion === "Entrada") {
    boton.textContent = "Registrar Entrada";
    boton.className = "btn-entrada";
  } else {
    boton.textContent = "Registrar Salida";
    boton.className = "btn-salida";
  }
}

// Registrar entrada o salida
function registrarAccion() {
  const idEmpleado = document.getElementById("idEmpleado").value.trim();
  const nombre = document.getElementById("nombreEmpleado").textContent;
  
  if (!idEmpleado || nombre === "Empleado no encontrado" || nombre === "Error al buscar empleado" || nombre === "Buscando...") {
    alert("Ingrese un ID de empleado válido");
    return;
  }
  
  // Obtener la acción a registrar
  const accion = document.getElementById("btnRegistrar").textContent.includes("Entrada") ? "Entrada" : "Salida";
  
  // Crear objeto de fecha y hora
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString('es-ES');
  const hora = ahora.toLocaleTimeString('es-ES');
  
  const nuevoRegistro = {
    id: idEmpleado,
    nombre: nombre,
    fecha: fecha,
    hora: hora,
    accion: accion,
    fechaCompleta: ahora.toISOString()
  };
  
  // Mostrar indicador de carga
  const boton = document.getElementById("btnRegistrar");
  const textoOriginal = boton.textContent;
  boton.textContent = "Procesando...";
  boton.disabled = true;
  
  // Guardar registro en Firebase
  db.collection("registros").add(nuevoRegistro)
    .then(() => {
      // Actualizar interfaz
      document.getElementById("idEmpleado").value = "";
      document.getElementById("nombreEmpleado").textContent = "";
      document.getElementById("horarioInfo").textContent = "";
      
      // Restaurar botón
      boton.textContent = textoOriginal;
      boton.disabled = false;
      
      // Actualizar tabla
      actualizarTablaRegistros();
      
      // Mostrar mensaje de éxito
      alert(`${accion} registrada correctamente para ${nombre} a las ${hora}`);
    })
    .catch((error) => {
      console.error("Error al registrar acción:", error);
      alert("Error al registrar acción: " + error.message);
      
      // Restaurar botón
      boton.textContent = textoOriginal;
      boton.disabled = false;
    });
}

// Actualizar tabla de registros diarios
function actualizarTablaRegistros() {
  const tablaBody = document.getElementById("tablaRegistrosBody");
  if (!tablaBody) return;
  
  tablaBody.innerHTML = "";
  
  // Mostrar indicador de carga
  tablaBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Cargando registros...</td></tr>`;
  
  // Filtrar registros del día actual
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  db.collection("registros")
    .where("fechaCompleta", ">=", hoy.toISOString())
    .orderBy("fechaCompleta", "desc")
    .get()
    .then((snapshot) => {
      tablaBody.innerHTML = ""; // Limpiar el indicador de carga
      
      if (snapshot.empty) {
        tablaBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">No hay registros para hoy</td></tr>`;
        return;
      }
      
      snapshot.forEach((doc) => {
        const reg = doc.data();
        const fila = document.createElement("tr");
        
        fila.innerHTML = `
          <td>${reg.id}</td>
          <td>${reg.nombre}</td>
          <td>${reg.accion}</td>
          <td>${reg.hora}</td>
        `;
        
        tablaBody.appendChild(fila);
      });
    })
    .catch((error) => {
      console.error("Error al cargar registros:", error);
      tablaBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Error al cargar registros: ${error.message}</td></tr>`;
    });
}

// Event listeners
window.addEventListener("DOMContentLoaded", () => {
  inicializarRegistros();
  
  // Buscar empleado al ingresar ID
  const inputId = document.getElementById("idEmpleado");
  if (inputId) {
    inputId.addEventListener("input", buscarEmpleado);
  }
  
  // Botón de registro
  const btnRegistrar = document.getElementById("btnRegistrar");
  if (btnRegistrar) {
    btnRegistrar.addEventListener("click", registrarAccion);
  }
});


if (accion === "Salida") {
  db.collection("registros")
    .where("id", "==", idEmpleado)
    .where("accion", "==", "Entrada")
    .where("fecha", "==", fecha)
    .orderBy("fechaCompleta", "desc")
    .limit(1)
    .get()
    .then(snapshot => {
      if (!snapshot.empty) {
        const entrada = snapshot.docs[0].data();
        const horaEntrada = new Date(entrada.fechaCompleta);
        const horaSalida = ahora;
        const diffMs = horaSalida - horaEntrada;
        const diffMins = Math.floor(diffMs / 60000);
        const horas = Math.floor(diffMins / 60);
        const minutos = diffMins % 60;
        const duracion = `Duración: ${horas}h ${minutos}m`;
        db.collection("reportes").doc(idEmpleado).set({
          [fecha]: {
            nombre: nombre,
            entrada: entrada.hora,
            salida: hora,
            duracion: duracion
          }
        }, { merge: true });
      }
    });
}