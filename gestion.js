// gestion.js - Gestión de usuarios (administrador)

// Estructura para almacenar usuarios con horarios
const empleadosInicialesCompletos = {
  "1001": {
    nombre: "Carlos Mendoza",
    horaEntrada: "08:00",
    horaSalida: "17:00",
    comidaInicio: "13:00",
    comidaFin: "14:00"
  },
  "1002": {
    nombre: "Lucía Fernández",
    horaEntrada: "09:00",
    horaSalida: "18:00",
    comidaInicio: "14:00",
    comidaFin: "15:00"
  },
  "1003": {
    nombre: "Miguel Torres",
    horaEntrada: "07:30",
    horaSalida: "16:30",
    comidaInicio: "12:30",
    comidaFin: "13:30"
  },
  "1004": {
    nombre: "Ana Gómez",
    horaEntrada: "08:30",
    horaSalida: "17:30",
    comidaInicio: "13:30",
    comidaFin: "14:30"
  },
  "1005": {
    nombre: "Javier Ruiz",
    horaEntrada: "08:00",
    horaSalida: "17:00",
    comidaInicio: "13:00",
    comidaFin: "14:00"
  },
  "1006": {
    nombre: "Daniela Castro",
    horaEntrada: "09:00",
    horaSalida: "18:00",
    comidaInicio: "14:00",
    comidaFin: "15:00"
  },
  "1007": {
    nombre: "Tomás Herrera",
    horaEntrada: "07:00",
    horaSalida: "16:00",
    comidaInicio: "12:00",
    comidaFin: "13:00"
  },
  "1008": {
    nombre: "Paula Ríos",
    horaEntrada: "08:30",
    horaSalida: "17:30",
    comidaInicio: "13:30",
    comidaFin: "14:30"
  },
  "1009": {
    nombre: "Sebastián Morales",
    horaEntrada: "08:00",
    horaSalida: "17:00",
    comidaInicio: "13:00",
    comidaFin: "14:00"
  },
  "1010": {
    nombre: "Valentina Pérez",
    horaEntrada: "09:00",
    horaSalida: "18:00",
    comidaInicio: "14:00",
    comidaFin: "15:00"
  },
  "1011": {
    nombre: "Federico Ramírez",
    horaEntrada: "08:30",
    horaSalida: "17:30",
    comidaInicio: "13:30",
    comidaFin: "14:30"
  },
  "1012": {
    nombre: "Isabela León",
    horaEntrada: "08:00",
    horaSalida: "17:00",
    comidaInicio: "13:00",
    comidaFin: "14:00"
  }
};

// Credenciales de administrador (en un sistema real, esto estaría en el servidor)
const credencialesAdmin = {
  usuario: "admin",
  password: "admin123"
};

// Inicializar datos de empleados con horarios
function inicializarEmpleadosCompletos() {
  let empleadosCompletos = JSON.parse(localStorage.getItem("empleadosCompletos"));
  if (!empleadosCompletos || Object.keys(empleadosCompletos).length === 0) {
    empleadosCompletos = { ...empleadosInicialesCompletos };
    localStorage.setItem("empleadosCompletos", JSON.stringify(empleadosCompletos));
    
    // También actualizamos la lista simple de empleados para compatibilidad
    const empleadosSimples = {};
    Object.entries(empleadosCompletos).forEach(([id, datos]) => {
      empleadosSimples[id] = datos.nombre;
    });
    localStorage.setItem("empleados", JSON.stringify(empleadosSimples));
  }
  mostrarTablaEmpleados();
}

// Mostrar tabla de empleados con todos sus datos
function mostrarTablaEmpleados() {
  const empleadosCompletos = JSON.parse(localStorage.getItem("empleadosCompletos")) || {};
  const tablaBody = document.getElementById("tablaEmpleadosBody");
  tablaBody.innerHTML = "";
  
  Object.entries(empleadosCompletos).forEach(([id, datos]) => {
    const fila = document.createElement("tr");
    
    fila.innerHTML = `
      <td>${id}</td>
      <td>${datos.nombre}</td>
      <td>${datos.horaEntrada}</td>
      <td>${datos.horaSalida}</td>
      <td>${datos.comidaInicio} - ${datos.comidaFin}</td>
      <td>
        <button class="btn-editar" data-id="${id}">Editar</button>
        <button class="btn-eliminar" data-id="${id}">Eliminar</button>
      </td>
    `;
    
    tablaBody.appendChild(fila);
  });
  
  // Agregar event listeners a los botones
  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', () => editarEmpleado(btn.dataset.id));
  });
  
  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', () => confirmarEliminarEmpleado(btn.dataset.id));
  });
}

// Función para mostrar modal de autenticación
function mostrarModalAuth(callback) {
  const modal = document.getElementById("modalAuth");
  const form = document.getElementById("formAuth");
  
  modal.style.display = "block";
  
  form.onsubmit = function(e) {
    e.preventDefault();
    const usuario = document.getElementById("authUsuario").value;
    const password = document.getElementById("authPassword").value;
    
    if (usuario === credencialesAdmin.usuario && password === credencialesAdmin.password) {
      modal.style.display = "none";
      callback(); // Ejecutar la acción después de autenticación exitosa
    } else {
      alert("Credenciales incorrectas");
    }
    
    form.reset();
  };
  
  document.querySelector(".cerrar-modal").onclick = function() {
    modal.style.display = "none";
    form.reset();
  };
}

// Función para agregar un nuevo empleado
function agregarEmpleado() {
  mostrarModalAuth(() => {
    document.getElementById("modalEmpleado").style.display = "block";
    document.getElementById("formEmpleado").reset();
    document.getElementById("modalTitulo").textContent = "Agregar Nuevo Empleado";
    document.getElementById("formEmpleado").dataset.modo = "agregar";
  });
}

// Función para editar un empleado existente
function editarEmpleado(id) {
  mostrarModalAuth(() => {
    const empleadosCompletos = JSON.parse(localStorage.getItem("empleadosCompletos")) || {};
    const empleado = empleadosCompletos[id];
    
    if (!empleado) {
      alert("Empleado no encontrado");
      return;
    }
    
    const form = document.getElementById("formEmpleado");
    form.dataset.modo = "editar";
    form.dataset.id = id;
    
    document.getElementById("empleadoId").value = id;
    document.getElementById("empleadoId").disabled = true; // No permitir cambiar ID en edición
    document.getElementById("empleadoNombre").value = empleado.nombre;
    document.getElementById("horaEntrada").value = empleado.horaEntrada;
    document.getElementById("horaSalida").value = empleado.horaSalida;
    document.getElementById("comidaInicio").value = empleado.comidaInicio;
    document.getElementById("comidaFin").value = empleado.comidaFin;
    
    document.getElementById("modalTitulo").textContent = "Editar Empleado";
    document.getElementById("modalEmpleado").style.display = "block";
  });
}

// Función para confirmar eliminación de empleado
function confirmarEliminarEmpleado(id) {
  mostrarModalAuth(() => {
    const empleadosCompletos = JSON.parse(localStorage.getItem("empleadosCompletos")) || {};
    const nombre = empleadosCompletos[id]?.nombre || id;
    
    if (confirm(`¿Está seguro que desea eliminar al empleado ${nombre}?`)) {
      eliminarEmpleado(id);
    }
  });
}

// Función para eliminar un empleado
function eliminarEmpleado(id) {
  let empleadosCompletos = JSON.parse(localStorage.getItem("empleadosCompletos")) || {};
  let empleadosSimples = JSON.parse(localStorage.getItem("empleados")) || {};
  
  if (!empleadosCompletos[id]) {
    alert("Empleado no encontrado");
    return;
  }
  
  delete empleadosCompletos[id];
  delete empleadosSimples[id];
  
  localStorage.setItem("empleadosCompletos", JSON.stringify(empleadosCompletos));
  localStorage.setItem("empleados", JSON.stringify(empleadosSimples));
  
  mostrarTablaEmpleados();
}

// Función para guardar un empleado (nuevo o editado)
function guardarEmpleado(e) {
  e.preventDefault();
  
  const form = e.target;
  const modo = form.dataset.modo;
  
  const id = document.getElementById("empleadoId").value.trim();
  const nombre = document.getElementById("empleadoNombre").value.trim();
  const horaEntrada = document.getElementById("horaEntrada").value;
  const horaSalida = document.getElementById("horaSalida").value;
  const comidaInicio = document.getElementById("comidaInicio").value;
  const comidaFin = document.getElementById("comidaFin").value;
  
  if (!id || !nombre || !horaEntrada || !horaSalida || !comidaInicio || !comidaFin) {
    alert("Complete todos los campos");
    return;
  }
  
  let empleadosCompletos = JSON.parse(localStorage.getItem("empleadosCompletos")) || {};
  let empleadosSimples = JSON.parse(localStorage.getItem("empleados")) || {};
  
  // Validar que el ID no exista si estamos agregando
  if (modo === "agregar" && empleadosCompletos[id]) {
    alert("ID ya registrado");
    return;
  }
  
  // Validar formato de horas (HH:MM)
  const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!horaRegex.test(horaEntrada) || !horaRegex.test(horaSalida) || 
      !horaRegex.test(comidaInicio) || !horaRegex.test(comidaFin)) {
    alert("Formato de hora incorrecto. Use HH:MM (ejemplo: 08:30)");
    return;
  }
  
  // Guardar datos
  empleadosCompletos[id] = {
    nombre,
    horaEntrada,
    horaSalida,
    comidaInicio,
    comidaFin
  };
  
  empleadosSimples[id] = nombre;
  
  localStorage.setItem("empleadosCompletos", JSON.stringify(empleadosCompletos));
  localStorage.setItem("empleados", JSON.stringify(empleadosSimples));
  
  document.getElementById("modalEmpleado").style.display = "none";
  mostrarTablaEmpleados();
}

// Event listeners
window.addEventListener("DOMContentLoaded", () => {
  inicializarEmpleadosCompletos();
  
  // Botón para agregar empleado
  document.getElementById("btnAgregarEmpleado").addEventListener("click", agregarEmpleado);
  
  // Form para guardar empleado
  document.getElementById("formEmpleado").addEventListener("submit", guardarEmpleado);
  
  // Cerrar modal de empleado
  document.querySelector("#modalEmpleado .cerrar-modal").addEventListener("click", () => {
    document.getElementById("modalEmpleado").style.display = "none";
  });
  
  // Habilitar campo ID al agregar nuevo empleado
  document.getElementById("btnAgregarEmpleado").addEventListener("click", () => {
    document.getElementById("empleadoId").disabled = false;
  });
});