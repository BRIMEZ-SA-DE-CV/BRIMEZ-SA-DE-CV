// app.js - Lógica común y funciones reutilizables

// Función para formatear fecha y hora
function formatearFechaHora(fecha) {
  const opciones = { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false
  };
  return new Date(fecha).toLocaleString('es-ES', opciones);
}

// Función para formatear solo la hora
function formatearHora(fecha) {
  const opciones = { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false
  };
  return new Date(fecha).toLocaleString('es-ES', opciones);
}

// Función para formatear solo la fecha
function formatearFecha(fecha) {
  const opciones = { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit'
  };
  return new Date(fecha).toLocaleString('es-ES', opciones);
}

// Función para obtener el nombre de un empleado por su ID
function obtenerNombreEmpleado(id) {
  const empleados = JSON.parse(localStorage.getItem("empleados")) || {};
  const empleado = empleados[id];
  
  if (empleado) {
    // Verificar si es un objeto (nueva estructura) o un string (estructura antigua)
    if (typeof empleado === 'object' && empleado !== null) {
      return empleado.nombre;
    }
    return empleado; // Si es string (estructura antigua)
  }
  
  return "Empleado no encontrado";
}

// Función para obtener los datos completos de un empleado por su ID
function obtenerDatosEmpleado(id) {
  const empleadosCompletos = JSON.parse(localStorage.getItem("empleadosCompletos")) || {};
  return empleadosCompletos[id] || null;
}

// Función para calcular horas trabajadas
function calcularHorasTrabajadas(entrada, salida, comidaInicio, comidaFin) {
  // Convertir strings de hora a objetos Date
  const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
  
  const entradaDate = new Date(`${hoy}T${entrada}:00`);
  const salidaDate = new Date(`${hoy}T${salida}:00`);
  const comidaInicioDate = new Date(`${hoy}T${comidaInicio}:00`);
  const comidaFinDate = new Date(`${hoy}T${comidaFin}:00`);
  
  // Calcular tiempo total (en milisegundos)
  const tiempoTotal = salidaDate - entradaDate;
  
  // Calcular tiempo de comida (en milisegundos)
  const tiempoComida = comidaFinDate - comidaInicioDate;
  
  // Calcular tiempo trabajado (en milisegundos)
  const tiempoTrabajado = tiempoTotal - tiempoComida;
  
  // Convertir a horas (dividir por 1000 para segundos, luego por 3600 para horas)
  const horasTrabajadas = tiempoTrabajado / (1000 * 60 * 60);
  
  return horasTrabajadas;
}

// Función para calcular horas extras
function calcularHorasExtras(entrada, salida, comidaInicio, comidaFin, horaEntradaNormal, horaSalidaNormal) {
  const horasTrabajadas = calcularHorasTrabajadas(entrada, salida, comidaInicio, comidaFin);
  const horasNormales = calcularHorasTrabajadas(horaEntradaNormal, horaSalidaNormal, comidaInicio, comidaFin);
  
  return Math.max(0, horasTrabajadas - horasNormales);
}

// Función para navegar entre páginas
function irAPagina(pagina) {
  window.location.href = pagina;
}

// Función para mostrar el nombre del empleado al ingresar el ID
// Función para mostrar el nombre del empleado al ingresar el ID
function mostrarNombreEmpleado() {
  const idInput = document.getElementById("idEmpleado");
  const nombreSpan = document.getElementById("nombreEmpleado");
  
  if (idInput && nombreSpan) {
    const id = idInput.value.trim();
    
    if (id) {
      // Usar directamente la función local obtenerNombreEmpleado
      const nombre = obtenerNombreEmpleado(id);
      
      nombreSpan.textContent = nombre;
      nombreSpan.style.display = "block";
    } else {
      nombreSpan.textContent = "";
      nombreSpan.style.display = "none";
    }
  }
}

// Agregar event listener para el campo de ID
document.addEventListener("DOMContentLoaded", function() {
  const idInput = document.getElementById("idEmpleado");
  
  if (idInput) {
    idInput.addEventListener("input", mostrarNombreEmpleado);
  }
});

// Exportar funciones para uso en otros archivos
window.appUtils = {
  formatearFechaHora,
  formatearHora,
  formatearFecha,
  obtenerNombreEmpleado,
  obtenerDatosEmpleado,
  calcularHorasTrabajadas,
  calcularHorasExtras,
  irAPagina
};