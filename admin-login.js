// admin-login.js - Autenticación de administrador
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginForm").addEventListener("submit", verificarCredenciales);
});

function verificarCredenciales(e) {
  e.preventDefault();
  
  const usuario = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  
  // ❌ Credenciales hardcodeadas
  if (app.verificarAdmin(usuario, password)) {
    // Guardar estado de autenticación
    sessionStorage.setItem("adminAutenticado", "true");
    
    // Redirigir a la página de gestión
    window.location.href = "gestion.html";
  } else {
    app.mostrarNotificacion("Credenciales incorrectas", "error");
  }
  
  // ✅ Implementar Firebase Authentication
  import { signInWithEmailAndPassword } from "firebase/auth";
}