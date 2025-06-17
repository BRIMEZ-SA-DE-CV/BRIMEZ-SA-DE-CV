// script.js - Sistema completo de registro de entradas/salidas
window.addEventListener("DOMContentLoaded", () => {
  inicializarApp();
  document.getElementById("employeeId").addEventListener("input", actualizarNombre);
  cargarRegistrosHoy();
});

// Objeto app con utilidades comunes
const app = {
  iniciarReloj: function() {
    setInterval(() => {
      const ahora = new Date();
      document.getElementById('clock').textContent = ahora.toLocaleTimeString('es-ES');
    }, 1000);
  },
  
  formatearHora: function(fecha) {
    return fecha.toLocaleTimeString('es-ES');
  },
  
  formatearTiempo: function(minutos) {
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    return `${horas}h ${minutosRestantes}m`;
  },
  
  mostrarNotificacion: function(mensaje, tipo) {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo === 'error' ? 'toast-error' : 'toast-success'}`;
    toast.textContent = mensaje;
    document.getElementById('toastContainer').appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
};

function inicializarApp() {
  app.iniciarReloj();
  verificarFirebase();
}

function verificarFirebase() {
  if (!firebase || !firebase.firestore) {
    console.error("Firebase no está inicializado correctamente");
    app.mostrarNotificacion("Error de conexión con la base de datos", "error");
    return false;
  }
  return true;
}

function actualizarNombre() {
  const id = document.getElementById("employeeId").value.trim();
  
  if (!id) {
    document.getElementById("employeeName").value = "";
    document.getElementById("horarioInfo").textContent = "";
    return;
  }
  
  // Obtener datos del empleado desde Firebase
  db.collection("empleados").doc(id).get()
    .then((doc) => {
      if (doc.exists) {
        const empleado = doc.data();
        document.getElementById("employeeName").value = empleado.nombre;
        document.getElementById("horarioInfo").textContent = 
          `Horario: ${empleado.horarioEntrada} - ${empleado.horarioSalida} | Comida: ${empleado.comidaInicio} - ${empleado.comidaFin}`;
      } else {
        document.getElementById("employeeName").value = "ID no registrado";
        document.getElementById("horarioInfo").textContent = "";
      }
    })
    .catch((error) => {
      console.error("Error al obtener datos del empleado:", error);
      document.getElementById("employeeName").value = "Error al cargar datos";
      document.getElementById("horarioInfo").textContent = "";
    });
}



function calcularHorasExtras(id, nombre, minutosTrabajados) {
  // Obtener horario del empleado
  db.collection("empleados").doc(id).get()
    .then((doc) => {
      if (doc.exists) {
        const empleado = doc.data();
        const [horaSalida, minutoSalida] = empleado.horarioSalida.split(":").map(Number);
        const [horaEntrada, minutoEntrada] = empleado.horarioEntrada.split(":").map(Number);
        
        // Calcular minutos de jornada normal
        const minutosJornada = (horaSalida * 60 + minutoSalida) - (horaEntrada * 60 + minutoEntrada);
        
        // Si trabajó más que la jornada normal, registrar horas extras
        if (minutosTrabajados > minutosJornada) {
          const minutosExtra = minutosTrabajados - minutosJornada;
          const horasExtras = Math.floor(minutosExtra / 60);
          const minutosRestantes = minutosExtra % 60;
          
          // Guardar registro de horas extras
          const fecha = new Date().toLocaleDateString('es-ES');
          const registroExtra = {
            id,
            nombre,
            fecha,
            fechaCompleta: new Date().toISOString(),
            minutosExtra,
            horasExtrasFormato: `${horasExtras}h ${minutosRestantes}m`
          };
          
          // Guardar en colección de horas extras
          db.collection("horasExtras").add(registroExtra)
            .then(() => {
              console.log("Horas extras registradas:", registroExtra.horasExtrasFormato);
            })
            .catch(error => {
              console.error("Error al registrar horas extras:", error);
            });
        }
      }
    })
    .catch(error => {
      console.error("Error al obtener datos del empleado para horas extras:", error);
    });
}

// Función para cargar los registros del día actual
function cargarRegistrosHoy() {
  const registroContainer = document.getElementById("registroContainer");
  
  // Mostrar indicador de carga
  registroContainer.innerHTML = '<div class="empty-state">Cargando registros...</div>';
  
  // Consultar registros de hoy en Firebase
  const inicioHoy = new Date();
  inicioHoy.setHours(0, 0, 0, 0);
  
  db.collection("registros")
    .where("fechaCompleta", ">=", inicioHoy.toISOString())
    .orderBy("fechaCompleta", "desc")
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        registroContainer.innerHTML = '<div class="empty-state"><h3>No hay registros para hoy</h3><p>Los registros aparecerán aquí cuando se realicen.</p></div>';
        return;
      }
      
      // Agrupar registros por empleado
      const registrosPorEmpleado = {};
      
      snapshot.forEach(doc => {
        const registro = doc.data();
        const id = registro.id;
        
        if (!registrosPorEmpleado[id]) {
          registrosPorEmpleado[id] = {
            id: id,
            nombre: registro.nombre,
            entradas: [],
            salidas: []
          };
        }
        
        if (registro.tipo === "Entrada") {
          registrosPorEmpleado[id].entradas.push({
            hora: registro.hora,
            tiempoTrabajado: registro.tiempoTrabajado
          });
        } else {
          registrosPorEmpleado[id].salidas.push({
            hora: registro.hora
          });
        }
      });
      
      // Generar HTML para cada empleado
      registroContainer.innerHTML = '';
      const hoy = new Date().toLocaleDateString('es-ES');
      
      Object.values(registrosPorEmpleado).forEach(empleado => {
        const empleadoCard = document.createElement("div");
        empleadoCard.className = "empleado-card";
        
        empleadoCard.innerHTML = `
          <div class="empleado-header">
            <span>${empleado.nombre} (ID: ${empleado.id})</span>
            <span>${hoy}</span>
          </div>
          <div class="empleado-registros">
            <div class="registro-seccion registro-entrada">
              <div class="registro-titulo">
                <span class="accion-icon">⬇️</span> Entradas (${empleado.entradas.length})
              </div>
              ${empleado.entradas.length > 0 ? 
                empleado.entradas.map(entrada => `
                  <div class="registro-item">
                    <span>${entrada.hora}</span>
                    ${entrada.tiempoTrabajado ? `<span>Duración: ${entrada.tiempoTrabajado}</span>` : ''}
                  </div>
                `).join('') : 
                '<div class="sin-registros">No hay registros de entrada</div>'
              }
            </div>
            <div class="registro-seccion registro-salida">
              <div class="registro-titulo">
                <span class="accion-icon">⬆️</span> Salidas (${empleado.salidas.length})
              </div>
              ${empleado.salidas.length > 0 ? 
                empleado.salidas.map(salida => `
                  <div class="registro-item">
                    <span>${salida.hora}</span>
                  </div>
                `).join('') : 
                '<div class="sin-registros">No hay registros de salida</div>'
              }
            </div>
          </div>
        `;
        
        registroContainer.appendChild(empleadoCard);
      });
    })
    .catch(error => {
      console.error("Error al cargar registros:", error);
      registroContainer.innerHTML = `<div class="empty-state"><h3>Error al cargar registros</h3><p>${error.message}</p></div>`;
    });
}

// Función para reiniciar registros (solo para desarrollo)
function reiniciarRegistros() {
  if (confirm("¿Está seguro de reiniciar todos los registros? Esta acción no se puede deshacer.")) {
    // Eliminar todos los registros de hoy
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);
    
    db.collection("registros")
      .where("fechaCompleta", ">=", inicioHoy.toISOString())
      .get()
      .then((snapshot) => {
        const batch = db.batch();
        
        snapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        return batch.commit();
      })
      .then(() => {
        app.mostrarNotificacion("Registros reiniciados correctamente", "success");
        cargarRegistrosHoy();
      })
      .catch(error => {
        console.error("Error al reiniciar registros:", error);
        app.mostrarNotificacion("Error al reiniciar registros: " + error.message, "error");
      });
  }
}


function mostrarToast(mensaje, tipo = "success") {
    const toast = document.createElement("div");
    toast.className = "toast toast-" + (tipo === "error" ? "error" : "success");
    toast.textContent = mensaje;
    document.getElementById("toastContainer").appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 2500);
}
