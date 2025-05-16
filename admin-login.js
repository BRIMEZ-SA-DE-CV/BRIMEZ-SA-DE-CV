// admin-login.js - Autenticación de administrador
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginForm").addEventListener("submit", verificarCredenciales);
});

function verificarCredenciales(e) {
  e.preventDefault();
  
  const usuario = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  
  if (!usuario || !password) {
    app.mostrarNotificacion("Complete todos los campos", "error");
    return;
  }
  
  if (app.verificarAdmin(usuario, password)) {
    // Guardar estado de autenticación
    sessionStorage.setItem("adminAutenticado", "true");
    
    // Redirigir a la página de gestión
    window.location.href = "gestion.html";
  } else {
    app.mostrarNotificacion("Credenciales incorrectas", "error");
  }
}