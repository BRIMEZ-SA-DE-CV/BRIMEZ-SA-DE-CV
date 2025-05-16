// script.js - Optimizado para registro de entradas/salidas
window.addEventListener("DOMContentLoaded", () => {
  app.inicializarEmpleados();
  document.getElementById("employeeId").addEventListener("input", actualizarNombre);
  cargarRegistros();
  app.iniciarReloj();
});

/* ============================
   ACTUALIZACIÓN DE NOMBRE
============================ */
function actualizarNombre() {
  const id = document.getElementById("employeeId").value.trim();
  const empleados = JSON.parse(localStorage.getItem("empleados")) || {};
  const empleado = empleados[id];
  
  if (empleado) {
    document.getElementById("employeeName").value = empleado.nombre;
    document.getElementById("horarioInfo").textContent = 
      `Horario: ${empleado.horarioEntrada} - ${empleado.horarioSalida} | Comida: ${empleado.comidaInicio} - ${empleado.comidaFin}`;
  } else {
    document.getElementById("employeeName").value = "ID no registrado";
    document.getElementById("horarioInfo").textContent = "";
  }
}

/* ============================
   VALIDACIÓN DE ENTRADA/SALIDA
============================ */
function registrar(tipo) {
  const id = document.getElementById("employeeId").value.trim();
  const nombre = document.getElementById("employeeName").value.trim();

  if (!id || nombre === "ID no registrado") {
    app.mostrarNotificacion("¡ID no válido! Verifique e intente de nuevo.", "error");
    return;
  }

  const registros = JSON.parse(localStorage.getItem("registros")) || [];
  const empleados = JSON.parse(localStorage.getItem("empleados")) || {};
  const empleado = empleados[id];

  // Buscar la última entrada del usuario SIN salida registrada
  const ultimoRegistro = registros.find(r => r.id === id && r.tipo === "Entrada" && !r.tiempoTrabajado);

  if (tipo === "Entrada" && ultimoRegistro) {
    app.mostrarNotificacion("Ya existe una entrada activa sin salida registrada.", "error");
    return;
  }

  if (tipo === "Salida" && !ultimoRegistro) {
    app.mostrarNotificacion("No se ha registrado una entrada previa.", "error");
    return;
  }

  const ahora = new Date();
  const hora = app.formatearHora(ahora);
  const fecha = ahora.toISOString().split("T")[0];

  if (tipo === "Salida" && ultimoRegistro) {
    const horaEntrada = new Date(`${ultimoRegistro.fecha}T${app.convertirHora24(ultimoRegistro.hora)}`);
    const diferenciaMs = ahora - horaEntrada;
    const minutos = Math.floor(diferenciaMs / 60000);
    const tiempoTrabajado = app.formatearTiempo(minutos);

    // Actualizo el registro anterior con el tiempo trabajado
    ultimoRegistro.tiempoTrabajado = tiempoTrabajado;

    // Actualizo el LocalStorage
    const index = registros.findIndex(r => r.id === id && r.tipo === "Entrada" && !r.tiempoTrabajado);
    registros[index] = ultimoRegistro;

    // Calcular horas extras
    let horasExtras = 0;
    if (empleado) {
      const horarioSalida = empleado.horarioSalida;
      const [horaSalida, minutoSalida] = horarioSalida.split(":").map(Number);
      const horaSalidaProgramada = new Date();
      horaSalidaProgramada.setHours(horaSalida, minutoSalida, 0);
      
      if (ahora > horaSalidaProgramada) {
        horasExtras = Math.floor((ahora - horaSalidaProgramada) / 60000);
      }
    }

    actualizarAcumulado(id, nombre, minutos, horasExtras);
    app.mostrarNotificacion(`Salida registrada. Tiempo trabajado: ${tiempoTrabajado}`, "success");
  } else {
    app.mostrarNotificacion(`Entrada registrada a las ${hora}`, "success");
  }

  const nuevoRegistro = { id, nombre, tipo, hora, fecha };
  registros.unshift(nuevoRegistro);
  localStorage.setItem("registros", JSON.stringify(registros));

  agregarFila(nuevoRegistro);
  document.getElementById("employeeId").value = "";
  document.getElementById("employeeName").value = "";
  document.getElementById("horarioInfo").textContent = "";
}

/* ============================
   ACTUALIZACIÓN DE LA TABLA
============================ */
function agregarFila(registro) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${registro.id}</td>
    <td>${registro.nombre}</td>
    <td class="accion-${registro.tipo.toLowerCase()}">${registro.tipo}</td>
    <td>${registro.hora}</td>
    ${registro.tiempoTrabajado ? `<td>${registro.tiempoTrabajado}</td>` : '<td>-</td>'}
  `;
  document.querySelector("#registroTabla tbody").appendChild(tr);
}

function cargarRegistros() {
  const registros = JSON.parse(localStorage.getItem("registros")) || [];
  document.querySelector("#registroTabla tbody").innerHTML = "";
  
  // Mostrar solo los registros del día actual
  const hoy = new Date().toISOString().split("T")[0];
  const registrosHoy = registros.filter(r => r.fecha === hoy);
  
  registrosHoy.forEach(agregarFila);
}

/* ============================
   ACUMULACIÓN DE HORAS
============================ */
function actualizarAcumulado(id, nombre, minutosTrabajados, minutosExtra = 0) {
  let acumulado = JSON.parse(localStorage.getItem("acumuladoHoras")) || {};
  const fecha = new Date().toISOString().split("T")[0];
  
  if (!acumulado[id]) {
    acumulado[id] = { 
      nombre, 
      registros: {} 
    };
  }
  
  if (!acumulado[id].registros[fecha]) {
    acumulado[id].registros[fecha] = {
      minutos: 0,
      minutosExtra: 0
    };
  }
  
  acumulado[id].registros[fecha].minutos += minutosTrabajados;
  acumulado[id].registros[fecha].minutosExtra += minutosExtra;
  
  localStorage.setItem("acumuladoHoras", JSON.stringify(acumulado));
}

/* ============================
   REINICIO DE REGISTROS
============================ */
function reiniciarRegistros() {
  if (confirm("¿Está seguro de reiniciar todos los registros del día? Esta acción no se puede deshacer.")) {
    const registros = JSON.parse(localStorage.getItem("registros")) || [];
    const hoy = new Date().toISOString().split("T")[0];
    
    // Filtrar para mantener solo los registros de otros días
    const registrosFiltrados = registros.filter(r => r.fecha !== hoy);
    
    localStorage.setItem("registros", JSON.stringify(registrosFiltrados));
    cargarRegistros();
    app.mostrarNotificacion("Registros del día reiniciados correctamente", "info");
  }
}
