import { db } from "../firebase";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";

export const guardarPrediccion = async (
  userId,
  torneoId,
  partidoId,
  golesL,
  golesV,
  fechaPartido,
) => {
  const doceHoras = 12 * 60 * 60 * 1000;
  if (new Date(fechaPartido) - new Date() < doceHoras) {
    console.warn("Bloqueado: faltan menos de 12hs para el partido.");
    return false;
  }

  try {
    const docRef = doc(
      db,
      "torneos",
      torneoId,
      "predicciones",
      `${userId}_${partidoId}`,
    );
    await setDoc(docRef, {
      userId,
      partidoId,
      golesLocal: parseInt(golesL),
      golesVisitante: parseInt(golesV),
      fecha: new Date(),
    });
    return true;
  } catch (error) {
    console.error("Error al guardar predicción:", error);
    return false;
  }
};

export const obtenerMisPredicciones = async (userId, torneoId) => {
  try {
    const colRef = collection(db, "torneos", torneoId, "predicciones");
    const q = query(colRef, where("userId", "==", userId));
    const snap = await getDocs(q);

    const preds = {};
    snap.forEach((doc) => {
      const data = doc.data();
      preds[`${data.partidoId}_L`] = data.golesLocal;
      preds[`${data.partidoId}_V`] = data.golesVisitante;
    });
    return preds;
  } catch (error) {
    console.error("Error al obtener predicciones:", error);
    return {};
  }
};

export const calcularPuntos = (pred, real) => {
  if (!real || pred.golesL === undefined || pred.golesV === undefined) return 0;

  let puntos = 0;

  const tendenciaPred =
    pred.golesL > pred.golesV ? "L" : pred.golesL < pred.golesV ? "V" : "E";
  const tendenciaReal =
    real.golesL > real.golesV ? "L" : real.golesL < real.golesV ? "V" : "E";

  if (tendenciaPred === tendenciaReal) {
    puntos += 1;

    if (pred.golesL === real.golesL && pred.golesV === real.golesV) {
      puntos += 1;
    }
  }

  return puntos;
};

export const guardarResultadoOficial = async (partidoId, golesL, golesV) => {
  try {
    const docRef = doc(db, "resultados_oficiales", String(partidoId));
    await setDoc(docRef, {
      partidoId,
      golesLocal: parseInt(golesL),
      golesVisitante: parseInt(golesV),
      actualizado: new Date(),
    });
    return true;
  } catch (error) {
    console.error("Error al guardar resultado oficial:", error);
    return false;
  }
};

export const obtenerResultadosOficiales = async () => {
  const colRef = collection(db, "resultados_oficiales");
  const snap = await getDocs(colRef);
  const resultados = {};
  snap.forEach((doc) => {
    resultados[doc.id] = doc.data();
  });
  return resultados;
};

export const obtenerTodasLasPredicciones = async (torneoId) => {
  try {
    const colRef = collection(db, "torneos", torneoId, "predicciones");
    const snap = await getDocs(colRef);
    
    const todasLasPreds = {};
    snap.forEach(doc => {
      const data = doc.data();
      if (!todasLasPreds[data.userId]) todasLasPreds[data.userId] = {};
      
      todasLasPreds[data.userId][`${data.partidoId}_L`] = data.golesLocal;
      todasLasPreds[data.userId][`${data.partidoId}_V`] = data.golesVisitante;
    });
    return todasLasPreds;
  } catch (error) {
    console.error("Error al obtener todas las predicciones:", error);
    return {};
  }
};

