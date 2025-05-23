// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// ❌ Versión 9 en reporte.html vs Versión 11 aquí
const firebaseConfig = {
  apiKey: "AIzaSyBfDHo3vViwVMDfyPChyQyn0r4xih7O0jw",
  authDomain: "registro-horario-brimez.firebaseapp.com",
  projectId: "registro-horario-brimez",
  storageBucket: "registro-horario-brimez.firebasestorage.app",
  messagingSenderId: "1087754167148",
  appId: "1:1087754167148:web:db585aca2bb76c15ba4949",
  measurementId: "G-3S4NSSCGXW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Exportar para uso en otros archivos
export { app, analytics, db };