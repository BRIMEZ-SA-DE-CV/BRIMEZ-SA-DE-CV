// usuarios.js - Optimizado
// Eliminamos los empleados iniciales para que el usuario los agregue manualmente
const empleadosIniciales = {
  "1001": "Carlos Mendoza",
  "1002": "Lucía Fernández",
  "1003": "Miguel Torres",
  "1004": "Ana Gómez",
  "1005": "Javier Ruiz",
  "1006": "Daniela Castro",
  "1007": "Tomás Herrera",
  "1008": "Paula Ríos",
  "1009": "Sebastián Morales",
  "1010": "Valentina Pérez",
  "1011": "Federico Ramírez",
  "1012": "Isabela León"
};

function inicializarEmpleados() {
  let empleados = JSON.parse(localStorage.getItem("empleados"));
  if (!empleados || Object.keys(empleados).length === 0) {
    // Inicializar con objeto vacío
    empleados = {};
    localStorage.setItem("empleados", JSON.stringify(empleados));
  }
  mostrarLista();
}

function agregarUsuario() {
  const id = document.getElementById("newId").value.trim();
  const nombre = document.getElementById("newName").value.trim();
  const horarioEntrada = document.getElementById("horarioEntrada").value.trim();
  const horarioSalida = document.getElementById("horarioSalida").value.trim();
  const comidaInicio = document.getElementById("comidaInicio").value.trim();
  const comidaFin = document.getElementById("comidaFin").value.trim();

  if (!id || !nombre || !horarioEntrada || !horarioSalida || !comidaInicio || !comidaFin) {
    alert("Complete todos los campos");
    return;
  }

  // Validar formato de horas (HH:MM)
  const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!horaRegex.test(horarioEntrada) || !horaRegex.test(horarioSalida) || 
      !horaRegex.test(comidaInicio) || !horaRegex.test(comidaFin)) {
    alert("Formato de hora incorrecto. Use HH:MM (ejemplo: 08:30)");
    return;
  }

  let empleados = JSON.parse(localStorage.getItem("empleados")) || {};
  let empleadosCompletos = JSON.parse(localStorage.getItem("empleadosCompletos")) || {};

  if (empleados[id]) {
    alert("ID ya registrado");
    return;
  }

  // Guardar en empleados
  empleados[id] = {
    nombre: nombre,
    horarioEntrada: horarioEntrada,
    horarioSalida: horarioSalida,
    comidaInicio: comidaInicio,
    comidaFin: comidaFin
  };
  
  // Guardar también en empleadosCompletos
  empleadosCompletos[id] = {
    nombre: nombre,
    horaEntrada: horarioEntrada,
    horaSalida: horarioSalida,
    comidaInicio: comidaInicio,
    comidaFin: comidaFin
  };
  
  localStorage.setItem("empleados", JSON.stringify(empleados));
  localStorage.setItem("empleadosCompletos", JSON.stringify(empleadosCompletos));
  
  limpiarFormulario();
  mostrarLista();
}

function limpiarFormulario() {
  document.getElementById("newId").value = "";
  document.getElementById("newName").value = "";
  document.getElementById("horarioEntrada").value = "08:00";
  document.getElementById("horarioSalida").value = "17:00";
  document.getElementById("comidaInicio").value = "13:00";
  document.getElementById("comidaFin").value = "14:00";
}

function mostrarLista() {
  const empleados = JSON.parse(localStorage.getItem("empleados")) || {};
  const tbody = document.querySelector("#employeeTable tbody");
  tbody.innerHTML = "";
  
  Object.entries(empleados).forEach(([id, datos]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${id}</td>
      <td>${datos.nombre}</td>
      <td>${datos.horarioEntrada}</td>
      <td>${datos.horarioSalida}</td>
      <td>${datos.comidaInicio} - ${datos.comidaFin}</td>
      <td>
        <button onclick="editarEmpleado('${id}')" class="btn-editar">✏️</button>
        <button onclick="eliminarEmpleado('${id}')" class="btn-eliminar">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function editarEmpleado(id) {
  const empleados = JSON.parse(localStorage.getItem("empleados")) || {};
  const empleado = empleados[id];
  
  if (empleado) {
    document.getElementById("newId").value = id;
    document.getElementById("newName").value = empleado.nombre;
    document.getElementById("horarioEntrada").value = empleado.horarioEntrada;
    document.getElementById("horarioSalida").value = empleado.horarioSalida;
    document.getElementById("comidaInicio").value = empleado.comidaInicio;
    document.getElementById("comidaFin").value = empleado.comidaFin;
    
    // Cambiar el botón de agregar por actualizar
    const btnAgregar = document.querySelector(".btn-agregar");
    btnAgregar.textContent = "✅ Actualizar Empleado";
    btnAgregar.onclick = function() {
      actualizarEmpleado(id);
    };
  }
}

function actualizarEmpleado(id) {
  const nombre = document.getElementById("newName").value.trim();
  const horarioEntrada = document.getElementById("horarioEntrada").value.trim();
  const horarioSalida = document.getElementById("horarioSalida").value.trim();
  const comidaInicio = document.getElementById("comidaInicio").value.trim();
  const comidaFin = document.getElementById("comidaFin").value.trim();

  if (!nombre || !horarioEntrada || !horarioSalida || !comidaInicio || !comidaFin) {
    alert("Complete todos los campos");
    return;
  }

  // Validar formato de horas (HH:MM)
  const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!horaRegex.test(horarioEntrada) || !horaRegex.test(horarioSalida) || 
      !horaRegex.test(comidaInicio) || !horaRegex.test(comidaFin)) {
    alert("Formato de hora incorrecto. Use HH:MM (ejemplo: 08:30)");
    return;
  }

  // Actualizar en empleados
  let empleados = JSON.parse(localStorage.getItem("empleados")) || {};
  empleados[id] = {
    nombre: nombre,
    horarioEntrada: horarioEntrada,
    horarioSalida: horarioSalida,
    comidaInicio: comidaInicio,
    comidaFin: comidaFin
  };
  
  // Actualizar también en empleadosCompletos si existe
  let empleadosCompletos = JSON.parse(localStorage.getItem("empleadosCompletos")) || {};
  if (empleadosCompletos) {
    empleadosCompletos[id] = {
      nombre: nombre,
      horaEntrada: horarioEntrada,
      horaSalida: horarioSalida,
      comidaInicio: comidaInicio,
      comidaFin: comidaFin
    };
    localStorage.setItem("empleadosCompletos", JSON.stringify(empleadosCompletos));
  }
  
  localStorage.setItem("empleados", JSON.stringify(empleados));
  
  // Restaurar el botón de agregar
  const btnAgregar = document.querySelector(".btn-agregar");
  btnAgregar.textContent = "➕ Agregar Empleado";
  btnAgregar.onclick = agregarUsuario;
  
  limpiarFormulario();
  mostrarLista();
}

function eliminarEmpleado(id) {
  if (confirm(`¿Está seguro de eliminar al empleado con ID ${id}?`)) {
    // Eliminar de todos los almacenamientos
    let empleados = JSON.parse(localStorage.getItem("empleados")) || {};
    let empleadosCompletos = JSON.parse(localStorage.getItem("empleadosCompletos")) || {};
    
    // Eliminar el empleado de ambos objetos
    delete empleados[id];
    delete empleadosCompletos[id];
    
    // Guardar los cambios en localStorage
    localStorage.setItem("empleados", JSON.stringify(empleados));
    localStorage.setItem("empleadosCompletos", JSON.stringify(empleadosCompletos));
    
    // También eliminar registros asociados a este empleado
    let registros = JSON.parse(localStorage.getItem("registros")) || [];
    registros = registros.filter(reg => reg.idEmpleado !== id);
    localStorage.setItem("registros", JSON.stringify(registros));
    
    mostrarLista();
  }
}

// Función para obtener el nombre del empleado por ID
function obtenerNombreEmpleado(id) {
  const empleados = JSON.parse(localStorage.getItem("empleados")) || {};
  const empleado = empleados[id];
  
  // Verificar si el empleado existe y obtener el nombre correctamente
  if (empleado) {
    // Si es un objeto (nueva estructura)
    if (typeof empleado === 'object' && empleado !== null) {
      return empleado.nombre;
    }
    // Si es un string (estructura antigua)
    return empleado;
  }
  
  return "Empleado no encontrado";
}

window.addEventListener("DOMContentLoaded", () => {
  inicializarEmpleados();
  
  // Configurar el botón de agregar
  const btnAgregar = document.querySelector(".btn-agregar");
  if (btnAgregar) {
    btnAgregar.onclick = agregarUsuario;
  }
  
  // Exportar la función para que esté disponible globalmente
  window.obtenerNombreEmpleado = obtenerNombreEmpleado;
});
