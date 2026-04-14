import { db } from '../firebase';
import { 
  collection, addDoc, updateDoc, doc, 
  query, where, getDocs 
} from 'firebase/firestore';

export const crearTorneo = async (user, nombreTorneo) => {
  const q = query(collection(db, "torneos"), where("nombre", "==", nombreTorneo));
  const snap = await getDocs(q);
  
  if (!snap.empty) {
    throw new Error("Ya existe un torneo con ese nombre. Elige otro.");
  }

  const codigo = Math.random().toString(36).substring(2, 7).toUpperCase();
  
  const docRef = await addDoc(collection(db, "torneos"), {
    nombre: nombreTorneo,
    creadorId: user.uid,
    codigoAcceso: codigo,
    fechaCreacion: new Date(),
    participantes: { 
      [user.uid]: {
        nombre: user.displayName,
        email: user.email,
        foto: user.photoURL,
        estado: "autorizado" 
      }
    }
  });
  
  return { id: docRef.id, codigo };
};

export const solicitarUnirse = async (user, codigo) => {
  const q = query(collection(db, "torneos"), where("codigoAcceso", "==", codigo));
  const snap = await getDocs(q);
  
  if (snap.empty) throw new Error("Código no válido");
  
  const torneoDoc = snap.docs[0];
  const torneoRef = doc(db, "torneos", torneoDoc.id);
  
  await updateDoc(torneoRef, {
    [`participantes.${user.uid}`]: {
      nombre: user.displayName,
      email: user.email,
      foto: user.photoURL,
      estado: "pendiente"
    }
  });
  return torneoDoc.id;
};

export const gestionarParticipante = async (torneoId, participanteId, nuevoEstado, datosActuales) => {
  const torneoRef = doc(db, "torneos", torneoId);
  await updateDoc(torneoRef, {
    [`participantes.${participanteId}`]: {
      ...datosActuales,
      estado: nuevoEstado
    }
  });
};

