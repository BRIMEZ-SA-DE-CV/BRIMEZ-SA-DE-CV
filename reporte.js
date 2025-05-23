// reporte.js - Sistema de reportes para BRIMEZ
window.addEventListener("DOMContentLoaded", () => {
  inicializarReportes();
});

// Variables globales para el estado del reporte
let empleadoActual = 'todos';
let periodoActual = 'dia';

function inicializarReportes() {
  // Verificar Firebase
  if (!verificarFirebase()) return;
  
  // Cargar lista de empleados
  cargarEmpleados();
  
  // Configurar filtros
  configurarFiltros();
  
  // Cargar datos iniciales
  cargarDatosReporte();
}

function verificarFirebase() {
  if (!firebase || !firebase.firestore) {
    console.error("Firebase no está inicializado correctamente");
    mostrarMensaje("Error de conexión con la base de datos", "error");
    return false;
  }
  return true;
}

function mostrarMensaje(mensaje, tipo) {
  const toast = document.createElement('div');
  toast.className = `toast ${tipo === 'error' ? 'toast-error' : 'toast-success'}`;
  toast.textContent = mensaje;
  document.getElementById('toastContainer').appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Función para cargar la lista de empleados en el filtro
function cargarEmpleados() {
  const selectEmpleado = document.getElementById('filtroEmpleado');
  selectEmpleado.innerHTML = '<option value="todos">Cargando empleados...</option>';
  db.collection("empleados")
    .orderBy("nombre")
    .get()
    .then((snapshot) => {
      selectEmpleado.innerHTML = '<option value="todos">Todos los empleados</option>';
      if (snapshot.empty) {
        mostrarMensaje("No hay empleados registrados", "error");
        return;
      }
      snapshot.forEach(doc => {
        const empleado = doc.data();
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = `${empleado.nombre} (ID: ${doc.id})`;
        selectEmpleado.appendChild(option);
      });
    })
    .catch(error => {
      console.error("Error al cargar empleados:", error);
      mostrarMensaje("Error al cargar la lista de empleados", "error");
      selectEmpleado.innerHTML = '<option value="todos">Todos los empleados</option>';
    });
}

// Configurar los filtros de empleado y período
function configurarFiltros() {
  // Filtro de empleado
  document.getElementById('filtroEmpleado').addEventListener('change', function() {
    empleadoActual = this.value;
    cargarDatosReporte();
  });
  
  // Filtro de período
  const botonesPeriodo = document.querySelectorAll('.filtro-periodo button');
  botonesPeriodo.forEach(boton => {
    boton.addEventListener('click', function() {
      // Actualizar estado visual
      botonesPeriodo.forEach(b => b.classList.remove('activo'));
      this.classList.add('activo');
      
      // Actualizar período seleccionado
      periodoActual = this.dataset.periodo;
      cargarDatosReporte();
    });
  });
  
  // Botón de exportar
  document.getElementById('btnExportar').addEventListener('click', exportarCSV);
}

// Función para obtener la fecha límite según el período seleccionado
function obtenerFechaLimite(periodo) {
  const hoy = new Date();
  const fechaLimite = new Date(hoy);
  
  switch (periodo) {
    case 'dia':
      fechaLimite.setHours(0, 0, 0, 0);
      break;
    case 'semana':
      // Restar días hasta llegar al lunes (0 = domingo, 1 = lunes, etc.)
      const diaSemana = hoy.getDay();
      const diasARestar = diaSemana === 0 ? 6 : diaSemana - 1;
      fechaLimite.setDate(hoy.getDate() - diasARestar);
      fechaLimite.setHours(0, 0, 0, 0);
      break;
    case 'quincena':
      // Si estamos en la primera quincena (1-15), ir al día 1
      // Si estamos en la segunda quincena (16-31), ir al día 16
      if (hoy.getDate() <= 15) {
        fechaLimite.setDate(1);
      } else {
        fechaLimite.setDate(16);
      }
      fechaLimite.setHours(0, 0, 0, 0);
      break;
    case 'mes':
      fechaLimite.setDate(1);
      fechaLimite.setHours(0, 0, 0, 0);
      break;
  }
  
  return fechaLimite;
}

// Función principal para cargar los datos del reporte
function cargarDatosReporte() {
  const tablaContainer = document.getElementById('tablaReporte');
  const resumenContainer = document.getElementById('resumenReporte');
  
  // Mostrar indicador de carga
  tablaContainer.innerHTML = '<div class="cargando">Cargando datos...</div>';
  resumenContainer.innerHTML = '';
  
  // Obtener fecha límite según el período seleccionado
  const fechaLimite = obtenerFechaLimite(periodoActual);
  
  // Construir la consulta base
  let consulta = db.collection("registros")
    .where("fechaCompleta", ">=", fechaLimite.toISOString())
    .orderBy("fechaCompleta", "desc");
  
  // Filtrar por empleado si no es "todos"
  if (empleadoActual !== 'todos') {
    consulta = consulta.where("id", "==", empleadoActual);
  }
  
  // Ejecutar la consulta
  consulta.get()
    .then((snapshot) => {
      if (snapshot.empty) {
        tablaContainer.innerHTML = '<div class="sin-datos">No hay registros para el período seleccionado</div>';
        return;
      }
      
      // Procesar los registros
      const registros = [];
      snapshot.forEach(doc => {
        registros.push({
          docId: doc.id,
          ...doc.data()
        });
      });
      
      // Procesar los registros para mostrarlos en la tabla
      const registrosProcesados = procesarRegistros(registros);
      
      // Generar la tabla HTML
      generarTablaReporte(registrosProcesados, tablaContainer);
      
      // Generar el resumen
      generarResumenReporte(registrosProcesados, resumenContainer);
    })
    .catch(error => {
      console.error("Error al cargar datos del reporte:", error);
      tablaContainer.innerHTML = `<div class="error">Error al cargar datos: ${error.message}</div>`;
    });
}

// Función para procesar los registros y calcular horas trabajadas
function procesarRegistros(registros) {
  // Agrupar registros por empleado y fecha
  const registrosPorEmpleadoYFecha = {};
  
  // Primero, agrupar todos los registros
  registros.forEach(registro => {
    const idEmpleado = registro.id;
    const fecha = registro.fecha;
    const clave = `${idEmpleado}-${fecha}`;
    
    if (!registrosPorEmpleadoYFecha[clave]) {
      registrosPorEmpleadoYFecha[clave] = {
        id: idEmpleado,
        nombre: registro.nombre,
        fecha: fecha,
        entradas: [],
        salidas: []
      };
    }
    
    if (registro.tipo === "Entrada") {
      registrosPorEmpleadoYFecha[clave].entradas.push({
        hora: registro.hora,
        fechaCompleta: registro.fechaCompleta,
        tiempoTrabajado: registro.tiempoTrabajado
      });
    } else if (registro.tipo === "Salida") {
      registrosPorEmpleadoYFecha[clave].salidas.push({
        hora: registro.hora,
        fechaCompleta: registro.fechaCompleta
      });
    }
  });
  
  // Luego, procesar cada grupo para calcular horas trabajadas
  const registrosProcesados = [];
  
  // Obtener datos de empleados para calcular horas extras
  return new Promise((resolve, reject) => {
    db.collection("empleados").get()
      .then(snapshot => {
        const empleados = {};
        snapshot.forEach(doc => {
          empleados[doc.id] = doc.data();
        });
        
        // Procesar cada grupo de registros
        Object.values(registrosPorEmpleadoYFecha).forEach(grupo => {
          // Ordenar entradas y salidas por hora
          grupo.entradas.sort((a, b) => new Date(a.fechaCompleta) - new Date(b.fechaCompleta));
          grupo.salidas.sort((a, b) => new Date(a.fechaCompleta) - new Date(b.fechaCompleta));
          
          // Para cada entrada, buscar la salida correspondiente
          grupo.entradas.forEach((entrada, index) => {
            const salida = grupo.salidas[index];
            
            if (salida && entrada.fechaCompleta < salida.fechaCompleta) {
              // Calcular horas trabajadas
              const datosEmpleado = empleados[grupo.id] || {};
              const resultado = calcularHoras(entrada.fechaCompleta, salida.fechaCompleta, datosEmpleado);
              
              registrosProcesados.push({
                id: grupo.id,
                nombre: grupo.nombre,
                fecha: grupo.fecha,
                horaEntrada: entrada.hora,
                horaSalida: salida.hora,
                horasTrabajadas: resultado.horasTrabajadas,
                horasExtras: resultado.horasExtras
              });
            } else if (entrada.tiempoTrabajado) {
              // Si la entrada tiene tiempo trabajado registrado pero no hay salida correspondiente
              registrosProcesados.push({
                id: grupo.id,
                nombre: grupo.nombre,
                fecha: grupo.fecha,
                horaEntrada: entrada.hora,
                horaSalida: "Sin registro",
                horasTrabajadas: convertirTiempoAHoras(entrada.tiempoTrabajado),
                horasExtras: 0
              });
            } else {
              // Entrada sin salida correspondiente
              registrosProcesados.push({
                id: grupo.id,
                nombre: grupo.nombre,
                fecha: grupo.fecha,
                horaEntrada: entrada.hora,
                horaSalida: "Sin registro",
                horasTrabajadas: 0,
                horasExtras: 0
              });
            }
          });
          
          // Salidas sin entrada correspondiente
          if (grupo.salidas.length > grupo.entradas.length) {
            for (let i = grupo.entradas.length; i < grupo.salidas.length; i++) {
              registrosProcesados.push({
                id: grupo.id,
                nombre: grupo.nombre,
                fecha: grupo.fecha,
                horaEntrada: "Sin registro",
                horaSalida: grupo.salidas[i].hora,
                horasTrabajadas: 0,
                horasExtras: 0
              });
            }
          }
        });
        
        resolve(registrosProcesados);
      })
      .catch(error => {
        console.error("Error al obtener datos de empleados:", error);
        reject(error);
      });
  });
}

// Función para calcular horas trabajadas y extras
function calcularHoras(entradaStr, salidaStr, datosEmpleado) {
  const entrada = new Date(entradaStr);
  const salida = new Date(salidaStr);
  let tiempoTotal = salida - entrada;
  
  // Calcular tiempo de comida
  let tiempoComida = 0;
  if (datosEmpleado.comidaInicio && datosEmpleado.comidaFin) {
    const fechaBase = new Date(entrada);
    fechaBase.setHours(0, 0, 0, 0);
    
    const [hCI, mCI] = datosEmpleado.comidaInicio.split(':').map(Number);
    const [hCF, mCF] = datosEmpleado.comidaFin.split(':').map(Number);
    
    const comidaInicio = new Date(fechaBase);
    const comidaFin = new Date(fechaBase);
    
    comidaInicio.setHours(hCI, mCI, 0);
    comidaFin.setHours(hCF, mCF, 0);
    
    // Solo restar tiempo de comida si el período de trabajo incluye el tiempo de comida
    if (entrada <= comidaInicio && salida >= comidaFin) {
      tiempoComida = comidaFin - comidaInicio;
    }
  }
  
  // Calcular horas trabajadas (restando tiempo de comida)
  let horasTrabajadas = (tiempoTotal - tiempoComida) / (1000 * 60 * 60);
  horasTrabajadas = Math.max(0, horasTrabajadas);
  
  // Calcular horas extras
  let horasExtras = 0;
  if (datosEmpleado) {
    const horarioInicio = datosEmpleado.horarioEntrada;
    const horarioFin = datosEmpleado.horarioSalida;
    
    if (horarioInicio && horarioFin) {
      const fechaBase = new Date(entrada);
      fechaBase.setHours(0, 0, 0, 0);
      
      const [hI, mI] = horarioInicio.split(':').map(Number);
      const [hF, mF] = horarioFin.split(':').map(Number);
      
      const inicioLaboral = new Date(fechaBase);
      const finLaboral = new Date(fechaBase);
      
      inicioLaboral.setHours(hI, mI, 0);
      finLaboral.setHours(hF, mF, 0);
      
      // Calcular horas normales de trabajo
      const horasNormales = (finLaboral - inicioLaboral - tiempoComida) / (1000 * 60 * 60);
      
      // Si trabajó más que las horas normales, la diferencia son horas extras
      horasExtras = Math.max(0, horasTrabajadas - horasNormales);
    }
  }

  return { horasTrabajadas, horasExtras };
}

// Función para convertir formato "Xh Ym" a horas decimales
function convertirTiempoAHoras(tiempoStr) {
  if (!tiempoStr) return 0;
  
  const match = tiempoStr.match(/(\d+)h\s+(\d+)m/);
  if (!match) return 0;
  
  const horas = parseInt(match[1]);
  const minutos = parseInt(match[2]);
  
  return horas + (minutos / 60);
}

// Función para generar la tabla de reporte
function generarTablaReporte(registros, container) {
  // Crear tabla
  const tabla = document.createElement('table');
  tabla.className = 'tabla-reporte';
  
  // Crear encabezado
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>ID</th>
      <th>Nombre</th>
      <th>Fecha</th>
      <th>Hora Entrada</th>
      <th>Hora Salida</th>
      <th>Horas Trabajadas</th>
      <th>Horas Extras</th>
    </tr>
  `;
  tabla.appendChild(thead);
  
  // Crear cuerpo de la tabla
  const tbody = document.createElement('tbody');
  
  registros.forEach(registro => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${registro.id}</td>
      <td>${registro.nombre}</td>
      <td>${registro.fecha}</td>
      <td>${registro.horaEntrada}</td>
      <td>${registro.horaSalida}</td>
      <td>${registro.horasTrabajadas.toFixed(2)}</td>
      <td>${registro.horasExtras.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
  
  tabla.appendChild(tbody);
  
  // Limpiar y agregar la tabla al contenedor
  container.innerHTML = '';
  container.appendChild(tabla);
}

// Función para generar el resumen del reporte
function generarResumenReporte(registros, container) {
  // Agrupar por empleado
  const resumenPorEmpleado = {};
  
  registros.forEach(registro => {
    if (!resumenPorEmpleado[registro.id]) {
      resumenPorEmpleado[registro.id] = {
        id: registro.id,
        nombre: registro.nombre,
        diasTrabajados: 0,
        horasTotales: 0,
        horasExtras: 0
      };
    }
    
    // Contar como día trabajado solo si tiene horas trabajadas
    if (registro.horasTrabajadas > 0) {
      resumenPorEmpleado[registro.id].diasTrabajados++;
    }
    
    resumenPorEmpleado[registro.id].horasTotales += registro.horasTrabajadas;
    resumenPorEmpleado[registro.id].horasExtras += registro.horasExtras;
  });
  
  // Crear contenedor de resumen
  const resumenDiv = document.createElement('div');
  resumenDiv.className = 'resumen-container';
  
  // Título del resumen
  const titulo = document.createElement('h3');
  titulo.textContent = 'Resumen del Período';
  resumenDiv.appendChild(titulo);
  
  // Crear tabla de resumen
  const tabla = document.createElement('table');
  tabla.className = 'tabla-resumen';
  
  // Crear encabezado
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>ID</th>
      <th>Nombre</th>
      <th>Días Trabajados</th>
      <th>Horas Totales</th>
      <th>Horas Extras</th>
    </tr>
  `;
  tabla.appendChild(thead);
  
  // Crear cuerpo de la tabla
  const tbody = document.createElement('tbody');
  
  Object.values(resumenPorEmpleado).forEach(resumen => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${resumen.id}</td>
      <td>${resumen.nombre}</td>
      <td>${resumen.diasTrabajados}</td>
      <td>${resumen.horasTotales.toFixed(2)}</td>
      <td>${resumen.horasExtras.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
  
  tabla.appendChild(tbody);
  resumenDiv.appendChild(tabla);
  
  // Agregar totales generales
  const totales = Object.values(resumenPorEmpleado).reduce(
    (acc, curr) => {
      acc.diasTrabajados += curr.diasTrabajados;
      acc.horasTotales += curr.horasTotales;
      acc.horasExtras += curr.horasExtras;
      return acc;
    },
    { diasTrabajados: 0, horasTotales: 0, horasExtras: 0 }
  );
  
  const totalesDiv = document.createElement('div');
  totalesDiv.className = 'totales';
  totalesDiv.innerHTML = `
    <p><strong>Total Días Trabajados:</strong> ${totales.diasTrabajados}</p>
    <p><strong>Total Horas Trabajadas:</strong> ${totales.horasTotales.toFixed(2)}</p>
    <p><strong>Total Horas Extras:</strong> ${totales.horasExtras.toFixed(2)}</p>
  `;
  
  resumenDiv.appendChild(totalesDiv);
  
  // Limpiar y agregar el resumen al contenedor
  container.innerHTML = '';
  container.appendChild(resumenDiv);
}

// Función para exportar a CSV
function exportarCSV() {
  // Obtener fecha límite según el período seleccionado
  const fechaLimite = obtenerFechaLimite(periodoActual);
  
  // Construir la consulta base
  let consulta = db.collection("registros")
    .where("fechaCompleta", ">=", fechaLimite.toISOString())
    .orderBy("fechaCompleta", "desc");
  
  // Filtrar por empleado si no es "todos"
  if (empleadoActual !== 'todos') {
    consulta = consulta.where("id", "==", empleadoActual);
  }
  
  // Ejecutar la consulta
  consulta.get()
    .then((snapshot) => {
      if (snapshot.empty) {
        mostrarMensaje("No hay datos para exportar", "error");
        return;
      }
      
      // Procesar los registros
      const registros = [];
      snapshot.forEach(doc => {
        registros.push({
          docId: doc.id,
          ...doc.data()
        });
      });
      
      // Procesar los registros para el CSV
      procesarRegistros(registros)
        .then(registrosProcesados => {
          // Crear contenido CSV
          let csvContent = 'ID,Nombre,Fecha,Hora Entrada,Hora Salida,Horas Trabajadas,Horas Extras\n';
          
          registrosProcesados.forEach(registro => {
            const fila = [
              registro.id,
              registro.nombre,
              registro.fecha,
              registro.horaEntrada || '-',
              registro.horaSalida || '-',
              registro.horasTrabajadas.toFixed(2),
              registro.horasExtras.toFixed(2)
            ];
            
            // Escapar comas en los campos
            const filaEscapada = fila.map(campo => {
              if (typeof campo === 'string' && campo.includes(',')) {
                return `"${campo}"`;
              }
              return campo;
            });
            
            csvContent += filaEscapada.join(',') + '\n';
          });
          
          // Crear y descargar archivo
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          
          // Crear nombre de archivo con fecha actual
          const fechaActual = new Date().toISOString().split('T')[0];
          const nombreArchivo = `reporte_${periodoActual}_${fechaActual}.csv`;
          
          link.setAttribute('href', url);
          link.setAttribute('download', nombreArchivo);
          link.style.visibility = 'hidden';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          mostrarMensaje(`Reporte exportado como ${nombreArchivo}`, "success");
        })
        .catch(error => {
          console.error("Error al procesar registros para exportar:", error);
          mostrarMensaje("Error al exportar datos", "error");
        });
    })
    .catch(error => {
      console.error("Error al obtener datos para exportar:", error);
      mostrarMensaje("Error al exportar datos", "error");
    });
}