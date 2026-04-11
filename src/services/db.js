import { db } from "../firebase";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";

/**
 * Guarda la predicción de un usuario dentro de la subcolección de un torneo específico.
 */
export const guardarPrediccion = async (
  userId,
  torneoId,
  partidoId,
  golesL,
  golesV,
  fechaPartido,
) => {
  // Regla de las 12 horas: no permite guardar si falta poco para el partido
  const doceHoras = 12 * 60 * 60 * 1000;
  if (new Date(fechaPartido) - new Date() < doceHoras) {
    console.warn("Bloqueado: faltan menos de 12hs para el partido.");
    return false;
  }

  try {
    // La ruta es: torneos -> {idTorneo} -> predicciones -> {userId_idPartido}
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

/**
 * Recupera todas las predicciones de un usuario para un torneo específico.
 */
export const obtenerMisPredicciones = async (userId, torneoId) => {
  try {
    const colRef = collection(db, "torneos", torneoId, "predicciones");
    const q = query(colRef, where("userId", "==", userId));
    const snap = await getDocs(q);

    const preds = {};
    snap.forEach((doc) => {
      const data = doc.data();
      // Armamos el objeto con el formato que usa el estado 'predicciones' en App.jsx
      preds[`${data.partidoId}_L`] = data.golesLocal;
      preds[`${data.partidoId}_V`] = data.golesVisitante;
    });
    return preds;
  } catch (error) {
    console.error("Error al obtener predicciones:", error);
    return {};
  }
};

/**
 * Lógica de Puntos:
 * 1 punto por tendencia (ganador/empate)
 * +0.5 puntos por resultado exacto.
 */
export const calcularPuntos = (pred, real) => {
  if (!real || pred.golesL === undefined || pred.golesV === undefined) return 0;

  let puntos = 0;

  // Calculamos tendencia (Local, Visitante o Empate)
  const tendenciaPred =
    pred.golesL > pred.golesV ? "L" : pred.golesL < pred.golesV ? "V" : "E";
  const tendenciaReal =
    real.golesL > real.golesV ? "L" : real.golesL < real.golesV ? "V" : "E";

  // 1. Acierto de ganador o empate
  if (tendenciaPred === tendenciaReal) {
    puntos += 1;

    // 2. Acierto de resultado exacto (bono de 0.5)
    if (pred.golesL === real.golesL && pred.golesV === real.golesV) {
      puntos += 0.5;
    }
  }

  return puntos;
};

// Guardar el resultado oficial del partido (Solo Admin)
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

// Obtener todos los resultados oficiales para calcular el ranking
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
