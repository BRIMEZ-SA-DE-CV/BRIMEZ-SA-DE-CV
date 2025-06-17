import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBfDHo3vViwVMDfyPChyQyn0r4xih7O0jw",
  authDomain: "registro-horario-brimez.firebaseapp.com",
  projectId: "registro-horario-brimez",
  storageBucket: "registro-horario-brimez.firebasestorage.app",
  messagingSenderId: "1087754167148",
  appId: "1:1087754167148:web:db585aca2bb76c15ba4949",
  measurementId: "G-3S4NSSCGXW"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
export { app, analytics, db };