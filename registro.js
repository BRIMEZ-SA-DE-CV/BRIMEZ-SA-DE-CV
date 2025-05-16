// registro.js - Lógica para registro de entradas y salidas

// Inicializar registros si no existen
function inicializarRegistros() {
  if (!localStorage.getItem("registros")) {
    localStorage.setItem("registros", JSON.stringify([]));
  }
  actualizarTablaRegistros();
}

// Función para buscar empleado por ID
function buscarEmpleado() {
  const idEmpleado = document.getElementById("idEmpleado").value.trim();
  const nombreDisplay = document.getElementById("nombreEmpleado");
  
  if (!idEmpleado) {
    nombreDisplay.textContent = "";
    return;
  }
  
  const nombre = appUtils.obtenerNombreEmpleado(idEmpleado);
  nombreDisplay.textContent = nombre;
  
  // Determinar última acción para mostrar el botón correcto
  const ultimaAccion = obtenerUltimaAccion(idEmpleado);
  actualizarBotonRegistro(ultimaAccion);
}

// Obtener la última acción del empleado (entrada o salida)
function obtenerUltimaAccion(idEmpleado) {
  const registros = JSON.parse(localStorage.getItem("registros")) || [];
  
  // Filtrar registros del empleado y ordenar por fecha (más reciente primero)
  const registrosEmpleado = registros
    .filter(reg => reg.idEmpleado === idEmpleado)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Si no hay registros o el último es salida, la siguiente acción es entrada
  if (registrosEmpleado.length === 0 || registrosEmpleado[0].accion === "Salida") {
    return "Entrada";
  } else {
    return "Salida";
  }
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
  
  if (!idEmpleado || nombre === "Empleado no encontrado") {
    alert("Ingrese un ID de empleado válido");
    return;
  }
  
  const accion = obtenerUltimaAccion(idEmpleado);
  const timestamp = new Date().toISOString();
  
  const nuevoRegistro = {
    idEmpleado,
    nombre,
    accion,
    timestamp
  };
  
  // Guardar registro
  const registros = JSON.parse(localStorage.getItem("registros")) || [];
  registros.push(nuevoRegistro);
  localStorage.setItem("registros", JSON.stringify(registros));
  
  // Actualizar interfaz
  document.getElementById("idEmpleado").value = "";
  document.getElementById("nombreEmpleado").textContent = "";
  actualizarTablaRegistros();
  
  alert(`${accion} registrada correctamente para ${nombre}`);
}

// Actualizar tabla de registros diarios
function actualizarTablaRegistros() {
  const registros = JSON.parse(localStorage.getItem("registros")) || [];
  const tablaBody = document.getElementById("tablaRegistrosBody");
  tablaBody.innerHTML = "";
  
  // Filtrar registros del día actual
  const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
  const registrosHoy = registros.filter(reg => reg.timestamp.startsWith(hoy));
  
  // Ordenar por hora (más reciente primero)
  registrosHoy.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Mostrar en la tabla
  registrosHoy.forEach(reg => {
    const fila = document.createElement("tr");
    
    fila.innerHTML = `
      <td>${reg.idEmpleado}</td>
      <td>${reg.nombre}</td>
      <td>${reg.accion}</td>
      <td>${appUtils.formatearHora(reg.timestamp)}</td>
    `;
    
    tablaBody.appendChild(fila);
  });
}

// Event listeners
window.addEventListener("DOMContentLoaded", () => {
  inicializarRegistros();
  
  // Buscar empleado al ingresar ID
  document.getElementById("idEmpleado").addEventListener("input", buscarEmpleado);
  
  // Botón de registro
  document.getElementById("btnRegistrar").addEventListener("click", registrarAccion);
});