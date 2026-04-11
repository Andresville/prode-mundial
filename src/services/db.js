import { db } from '../firebase';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';

export const guardarPrediccion = async (userId, partidoId, golesL, golesV, fechaPartido) => {
  const doceHorasEnMs = 12 * 60 * 60 * 1000;
  if ((new Date(fechaPartido) - new Date()) < doceHorasEnMs) {
    alert("Bloqueado: faltan menos de 12hs");
    return false;
  }

  await setDoc(doc(db, "predicciones", `${userId}_${partidoId}`), {
    userId,
    partidoId,
    golesLocal: parseInt(golesL),
    golesVisitante: parseInt(golesV),
    fecha: new Date()
  });
  return true;
};

export const obtenerMisPredicciones = async (userId) => {
  const q = query(collection(db, "predicciones"), where("userId", "==", userId));
  const snap = await getDocs(q);
  const preds = {};
  snap.forEach(doc => {
    const data = doc.data();
    preds[`${data.partidoId}_L`] = data.golesLocal;
    preds[`${data.partidoId}_V`] = data.golesVisitante;
  });
  return preds;
};