// usuarios.js - Optimizado para Firebase
// Este archivo gestiona todas las operaciones CRUD de empleados usando Firebase Firestore

document.addEventListener('DOMContentLoaded', () => {
  inicializarEmpleados();
  
  // Configurar evento para el botón de agregar
  const btnAgregar = document.querySelector(".btn-agregar");
  if (btnAgregar) {
    btnAgregar.addEventListener('click', agregarUsuario);
  }
});

// Inicializa la colección de empleados en Firebase
function inicializarEmpleados() {
  // Verificar si hay datos en Firebase
  db.collection("empleados").get()
    .then((snapshot) => {
      if (snapshot.empty) {
        console.log("No hay empleados en la base de datos. Puedes agregar nuevos empleados.");
      } else {
        console.log("Empleados cargados desde Firebase");
      }
      mostrarLista();
    })
    .catch((error) => {
      console.error("Error al inicializar empleados:", error);
      alert("Error al cargar empleados: " + error.message);
    });
}

// Agrega un nuevo empleado a Firebase
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

  // Verificar si el ID ya existe
  db.collection("empleados").doc(id).get()
    .then((doc) => {
      if (doc.exists) {
        alert("ID ya registrado");
        return;
      }

      // Crear objeto de empleado
      const empleado = {
        nombre: nombre,
        horarioEntrada: horarioEntrada,
        horarioSalida: horarioSalida,
        comidaInicio: comidaInicio,
        comidaFin: comidaFin,
        fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Guardar en Firestore
      return db.collection("empleados").doc(id).set(empleado);
    })
    .then(() => {
      console.log("Empleado agregado correctamente");
      limpiarFormulario();
      mostrarLista();
    })
    .catch((error) => {
      console.error("Error al agregar empleado:", error);
      alert("Error al agregar empleado: " + error.message);
    });
}

// Limpia el formulario después de agregar o actualizar
function limpiarFormulario() {
  document.getElementById("newId").value = "";
  document.getElementById("newName").value = "";
  document.getElementById("horarioEntrada").value = "08:00";
  document.getElementById("horarioSalida").value = "17:00";
  document.getElementById("comidaInicio").value = "13:00";
  document.getElementById("comidaFin").value = "14:00";
  
  // Restaurar el botón de agregar si estaba en modo edición
  const btnAgregar = document.querySelector(".btn-agregar");
  if (btnAgregar && btnAgregar.textContent !== "➕ Agregar Empleado") {
    btnAgregar.textContent = "➕ Agregar Empleado";
    btnAgregar.onclick = agregarUsuario;
  }
}

// Muestra la lista de empleados desde Firebase
function mostrarLista() {
  const tbody = document.querySelector("#employeeTable tbody");
  tbody.innerHTML = "";
  
  // Mostrar indicador de carga
  tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Cargando empleados...</td></tr>`;
  
  db.collection("empleados").get()
    .then((snapshot) => {
      tbody.innerHTML = ""; // Limpiar el indicador de carga
      
      if (snapshot.empty) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No hay empleados registrados</td></tr>`;
        return;
      }
      
      snapshot.forEach((doc) => {
        const id = doc.id;
        const datos = doc.data();
        
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
    })
    .catch((error) => {
      console.error("Error al obtener empleados:", error);
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Error al cargar empleados: ${error.message}</td></tr>`;
    });
}

// Carga los datos de un empleado en el formulario para edición
function editarEmpleado(id) {
  db.collection("empleados").doc(id).get()
    .then((doc) => {
      if (!doc.exists) {
        alert("Empleado no encontrado");
        return;
      }
      
      const empleado = doc.data();
      
      document.getElementById("newId").value = id;
      document.getElementById("newId").disabled = true; // No permitir cambiar ID en edición
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
    })
    .catch((error) => {
      console.error("Error al obtener empleado para editar:", error);
      alert("Error al cargar datos del empleado: " + error.message);
    });
}

// Actualiza los datos de un empleado en Firebase
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

  // Crear objeto con datos actualizados
  const empleadoActualizado = {
    nombre: nombre,
    horarioEntrada: horarioEntrada,
    horarioSalida: horarioSalida,
    comidaInicio: comidaInicio,
    comidaFin: comidaFin,
    fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
  };

  // Actualizar en Firestore
  db.collection("empleados").doc(id).update(empleadoActualizado)
    .then(() => {
      console.log("Empleado actualizado correctamente");
      document.getElementById("newId").disabled = false;
      limpiarFormulario();
      mostrarLista();
      
      // Restaurar el botón de agregar
      const btnAgregar = document.querySelector(".btn-agregar");
      btnAgregar.textContent = "➕ Agregar Empleado";
      btnAgregar.onclick = agregarUsuario;
    })
    .catch((error) => {
      console.error("Error al actualizar empleado:", error);
      alert("Error al actualizar empleado: " + error.message);
    });
}

// Elimina un empleado de Firebase
function eliminarEmpleado(id) {
  if (confirm(`¿Está seguro de eliminar al empleado con ID ${id}?`)) {
    db.collection("empleados").doc(id).delete()
      .then(() => {
        console.log("Empleado eliminado correctamente");
        mostrarLista();
      })
      .catch((error) => {
        console.error("Error al eliminar empleado:", error);
        alert("Error al eliminar empleado: " + error.message);
      });
  }
}

// Función para obtener todos los empleados (útil para otras partes de la aplicación)
function obtenerTodosLosEmpleados() {
  return db.collection("empleados").get()
    .then((snapshot) => {
      const empleados = {};
      snapshot.forEach((doc) => {
        empleados[doc.id] = doc.data();
      });
      return empleados;
    });
}

// Función para obtener un empleado específico por ID
function obtenerEmpleadoPorId(id) {
  return db.collection("empleados").doc(id).get()
    .then((doc) => {
      if (doc.exists) {
        return doc.data();
      } else {
        return null;
      }
    });
}

// Función para migrar datos de localStorage a Firebase (útil para la transición)
function migrarDatosLocalStorageAFirebase() {
  const empleadosLS = JSON.parse(localStorage.getItem("empleados")) || {};
  const empleadosCompletosLS = JSON.parse(localStorage.getItem("empleadosCompletos")) || {};
  
  // Combinar datos de ambas fuentes
  const empleadosCombinados = {};
  
  // Procesar empleados simples
  Object.entries(empleadosLS).forEach(([id, datos]) => {
    if (typeof datos === 'string') {
      // Formato antiguo donde solo se guardaba el nombre
      empleadosCombinados[id] = {
        nombre: datos,
        horarioEntrada: "08:00",
        horarioSalida: "17:00",
        comidaInicio: "13:00",
        comidaFin: "14:00"
      };
    } else {
      // Formato nuevo donde se guarda un objeto con todos los datos
      empleadosCombinados[id] = {
        nombre: datos.nombre,
        horarioEntrada: datos.horarioEntrada,
        horarioSalida: datos.horarioSalida,
        comidaInicio: datos.comidaInicio,
        comidaFin: datos.comidaFin
      };
    }
  });
  
  // Procesar empleados completos (tienen prioridad)
  Object.entries(empleadosCompletosLS).forEach(([id, datos]) => {
    empleadosCombinados[id] = {
      nombre: datos.nombre,
      horarioEntrada: datos.horaEntrada || datos.horarioEntrada,
      horarioSalida: datos.horaSalida || datos.horarioSalida,
      comidaInicio: datos.comidaInicio,
      comidaFin: datos.comidaFin
    };
  });
  
  // Guardar en Firebase
  const batch = db.batch();
  
  Object.entries(empleadosCombinados).forEach(([id, datos]) => {
    const docRef = db.collection("empleados").doc(id);
    batch.set(docRef, {
      ...datos,
      fechaMigracion: firebase.firestore.FieldValue.serverTimestamp()
    });
  });
  
  return batch.commit()
    .then(() => {
      console.log("Migración completada con éxito");
      alert("Datos migrados correctamente a Firebase");
      mostrarLista();
    })
    .catch((error) => {
      console.error("Error en la migración:", error);
      alert("Error al migrar datos: " + error.message);
    });
}

// Agregar botón de migración si es necesario
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si hay datos en localStorage que necesiten migración
  const empleadosLS = JSON.parse(localStorage.getItem("empleados")) || {};
  const empleadosCompletosLS = JSON.parse(localStorage.getItem("empleadosCompletos")) || {};
  
  if (Object.keys(empleadosLS).length > 0 || Object.keys(empleadosCompletosLS).length > 0) {
    const container = document.querySelector('.card');
    if (container) {
      const btnMigrar = document.createElement('button');
      btnMigrar.textContent = "🔄 Migrar datos a Firebase";
      btnMigrar.className = "btn-migrar";
      btnMigrar.onclick = migrarDatosLocalStorageAFirebase;
      container.appendChild(btnMigrar);
    }
  }
});
const nuevoEmpleado = {
  id: doc.id,
  nombre: data.nombre,
  horarioEntrada: data.horarioEntrada,
  horarioSalida: data.horarioSalida,
  horarioComida: `${data.comidaInicio}-${data.comidaFin}` // Unificar formato
};
// ... existing code ...
