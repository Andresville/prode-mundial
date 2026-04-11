import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCyDk44e2nQkIqKaBUsxCdaj82FduLHT94",
  authDomain: "prodemundial-431ea.firebaseapp.com",
  projectId: "prodemundial-431ea",
  storageBucket: "prodemundial-431ea.firebasestorage.app",
  messagingSenderId: "299356818475",
  appId: "1:299356818475:web:d23d911918d58e20102e6e"
};


// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportamos las herramientas que usaremos
export const db = getFirestore(app); // Para la base de datos (partidos, puntos)
export const auth = getAuth(app);    // Para el login de amigos