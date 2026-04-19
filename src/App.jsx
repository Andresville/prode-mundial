import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { collection, query, onSnapshot } from "firebase/firestore";
import {
  Container,
  Button,
  Typography,
  Box,
  Card,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";

import AdminPanel from "./components/AdminPanel";
import Ranking from "./components/Ranking";
import CargaResultados from "./components/CargaResultados";
import ContenedorGrupo from "./components/ContenedorGrupo";
import Header from "./components/Header";
import LoginScreen from "./components/LoginScreen";
import SelectorTorneos from "./components/SelectorTorneos";

import { getDatosMundial } from "./services/api";
import {
  guardarPrediccion,
  obtenerMisPredicciones,
  obtenerResultadosOficiales,
  obtenerTodasLasPredicciones,
} from "./services/db";
import { crearTorneo, solicitarUnirse } from "./services/torneos";

import metLife from "./assets/Met-Life-Stadium.jpg";
import azteca from "./assets/Estadio-Azteca.png";
import att from "./assets/AT&T-Stadium.jpg";
import mercedes from "./assets/Mercedes-Benz-Stadium.jpg";
import hardRock from "./assets/Hard-Rock-Stadium.jpg";
import bcPlace from "./assets/BC-Stadium.jpg";
import bmoField from "./assets/BMO-Field-Stadium.jpg";
import bbva from "./assets/Estadio BBVA.jpg";
import akron from "./assets/Estadio-Akron.jpg";
import losAngeles from "./assets/Los-Angeles-Stadium.png";
import bayArea from "./assets/Bay-Area-Stadium.jpg";
import seattle from "./assets/Seattle-Stadium.jpg";
import copaImg from "./assets/foto login.jpg";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "beco2804@gmail.com";

const fondosPorGrupo = {
  "GROUP A": metLife,
  "GROUP B": azteca,
  "GROUP C": att,
  "GROUP D": mercedes,
  "GROUP E": hardRock,
  "GROUP F": bcPlace,
  "GROUP G": bmoField,
  "GROUP H": bbva,
  "GROUP I": akron,
  "GROUP J": losAngeles,
  "GROUP K": bayArea,
  "GROUP L": seattle,
  "Fase Final": copaImg,
};

function App() {
  const [user, setUser] = useState(null);
  const [esAdminMaestro, setEsAdminMaestro] = useState(false);
  const [misTorneos, setMisTorneos] = useState([]);
  const [torneoActivo, setTorneoActivo] = useState(null);
  const [partidos, setPartidos] = useState([]);
  const [predicciones, setPredicciones] = useState({});
  const [resultadosOficiales, setResultadosOficiales] = useState({});
  const [todasLasPreds, setTodasLasPreds] = useState({});
  const [cargando, setCargando] = useState(false);
  const [tabActual, setTabActual] = useState("partidos");
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("GROUP A");

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        setCargando(true);
        const dataPartidos = await getDatosMundial();
        setPartidos(dataPartidos);

        if (currentUser.email === ADMIN_EMAIL) {
          setEsAdminMaestro(true);
          setCargando(false);
          return;
        }

        setEsAdminMaestro(false);
        const q = query(collection(db, "torneos"));
        const unsubTorneo = onSnapshot(q, (snapshot) => {
          const torneosDelUsuario = snapshot.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((t) => {
              const info = t.participantes && t.participantes[currentUser.uid];
              return info && info.estado !== "rechazado";
            });

          setMisTorneos(torneosDelUsuario);
          setCargando(false);
        });

        return () => unsubTorneo();
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (
      user &&
      torneoActivo &&
      torneoActivo.participantes[user.uid]?.estado === "autorizado"
    ) {
      const cargarDatosTorneo = async () => {
        const preds = await obtenerMisPredicciones(user.uid, torneoActivo.id);
        setPredicciones(preds);

        const [resOficiales, todasPreds] = await Promise.all([
          obtenerResultadosOficiales(),
          obtenerTodasLasPredicciones(torneoActivo.id),
        ]);
        setResultadosOficiales(resOficiales);
        setTodasLasPreds(todasPreds);
      };
      cargarDatosTorneo();
    }
  }, [torneoActivo, user]);

  const handleLogin = () => {
    signInWithPopup(auth, new GoogleAuthProvider());
  };

  const handleCrear = async () => {
    const nombre = prompt("Nombre de tu nuevo grupo de amigos:");
    if (nombre) {
      try {
        const { codigo } = await crearTorneo(user, nombre);
        alert(`¡Grupo creado! Comparte este código: ${codigo}`);
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleUnirse = async () => {
    const cod = prompt("Pega el código de invitación:");
    if (cod) {
      try {
        await solicitarUnirse(user, cod.toUpperCase());
        alert("¡Solicitud enviada! Avisale al administrador que te autorice.");
      } catch (e) {
        alert("Error: " + e.message);
      }
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setTorneoActivo(null);
  };

  const handleInputChange = async (partidoId, golesL, golesV, fecha) => {
    const nuevasPredicciones = {
      ...predicciones,
      [`${partidoId}_L`]: golesL,
      [`${partidoId}_V`]: golesV,
    };
    setPredicciones(nuevasPredicciones);

    const exito = await guardarPrediccion(
      user.uid,
      torneoActivo.id,
      partidoId,
      golesL,
      golesV,
      fecha,
    );

    if (!exito) {
      alert(
        "No se pudo guardar. Recuerda que solo puedes editar hasta 12hs antes del partido.",
      );
    }
  };

  const estructuraGrupos = partidos.reduce((acc, p) => {
    const nombreGrupo = p.group ? p.group.replace("_", " ") : "Fase Final";
    if (!acc[nombreGrupo]) acc[nombreGrupo] = { partidos: [], equipos: [] };
    acc[nombreGrupo].partidos.push(p);
    [p.homeTeam, p.awayTeam].forEach((team) => {
      if (!acc[nombreGrupo].equipos.find((e) => e.name === team.name)) {
        acc[nombreGrupo].equipos.push(team);
      }
    });
    return acc;
  }, {});

  if (cargando)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        backgroundColor: "#1a1a1a",
        transition: "background-image 0.5s ease-in-out",
        backgroundImage: !user
          ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${copaImg})`
          : torneoActivo && tabActual === "partidos"
            ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url(${fondosPorGrupo[grupoSeleccionado] || copaImg})`
            : `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.9)), url(${copaImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        pb: 5,
      }}
    >
      {!user ? (
        <LoginScreen onLogin={handleLogin} />
      ) : !torneoActivo && !esAdminMaestro ? (
        <SelectorTorneos
          torneos={misTorneos}
          onSeleccionar={setTorneoActivo}
          onCrear={handleCrear}
          onUnirse={handleUnirse}
          user={user}
        />
      ) : (
        <>
          <Header
            user={user}
            onLogout={handleLogout}
            esAdminMaestro={esAdminMaestro}
            torneoActivo={torneoActivo}
            view={tabActual}
            setView={setTabActual}
            onBack={() => setTorneoActivo(null)}
          />

          <Container maxWidth="md" sx={{ mt: 4 }}>
            {esAdminMaestro ? (
              <Box sx={{ maxWidth: 600, mx: "auto" }}>
                <CargaResultados partidos={partidos} />
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                {torneoActivo.creadorId === user.uid &&
                  tabActual === "partidos" && (
                    <AdminPanel
                      torneoId={torneoActivo.id}
                      participantes={torneoActivo.participantes}
                    />
                  )}

                {torneoActivo.participantes[user.uid]?.estado ===
                "pendiente" ? (
                  <Box
                    sx={{
                      p: 4,
                      textAlign: "center",
                      borderRadius: 4,
                      color: "#fff",
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid #ffd700",
                    }}
                  >
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ color: "#ffd700" }}
                    >
                      Solicitud Pendiente
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                      Esperando aprobación en <b>{torneoActivo.nombre}</b>.
                    </Typography>
                    <Button
                      onClick={() => setTorneoActivo(null)}
                      sx={{ mt: 2, color: "#ffd700", fontWeight: "bold" }}
                    >
                      Volver al Selector
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    {tabActual === "partidos" && (
                      <Box>
                        <Box
                          sx={{
                            p: 2,
                            mb: 3,
                            borderRadius: 3,
                            textAlign: "center",
                            background: "rgba(255, 255, 255, 0.05)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "white",
                          }}
                        >
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 900,
                              textTransform: "uppercase",
                              color: "#ffd700",
                            }}
                          >
                            {torneoActivo.nombre}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            CÓDIGO DE ACCESO: <b>{torneoActivo.codigoAcceso}</b>
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "center",
                            gap: 1,
                            mb: 4,
                            px: 1,
                          }}
                        >
                          {Object.keys(estructuraGrupos).map((nombre) => (
                            <Button
                              key={nombre}
                              variant={
                                grupoSeleccionado === nombre
                                  ? "contained"
                                  : "outlined"
                              }
                              onClick={() => setGrupoSeleccionado(nombre)}
                              sx={{
                                borderRadius: "8px",
                                textTransform: "none",
                                fontWeight: 800,
                                minWidth: { xs: "32px", sm: "80px" },
                                height: { xs: "32px", sm: "40px" },
                                fontSize: { xs: "0.75rem", sm: "0.85rem" },
                                px: { xs: 0.5, sm: 2 },
                                borderColor: "#ffd700",
                                color:
                                  grupoSeleccionado === nombre
                                    ? "#000"
                                    : "#ffd700",
                                bgcolor:
                                  grupoSeleccionado === nombre
                                    ? "#ffd700"
                                    : "transparent",
                                "&:hover": {
                                  bgcolor: "#ffd700",
                                  color: "#000",
                                },
                              }}
                            >
                              <Box
                                component="span"
                                sx={{ display: { xs: "none", sm: "inline" } }}
                              >
                                {nombre.replace("GROUP", "Grupo")}
                              </Box>
                              <Box
                                component="span"
                                sx={{ display: { xs: "inline", sm: "none" } }}
                              >
                                {nombre.includes("GROUP")
                                  ? nombre.split(" ").pop()
                                  : "Fase Final"}
                              </Box>
                            </Button>
                          ))}
                        </Box>

                        {estructuraGrupos[grupoSeleccionado] && (
                          <ContenedorGrupo
                            nombre={grupoSeleccionado}
                            equipos={
                              estructuraGrupos[grupoSeleccionado].equipos
                            }
                            partidos={
                              estructuraGrupos[grupoSeleccionado].partidos
                            }
                            predicciones={predicciones}
                            onInputChange={handleInputChange}
                          />
                        )}
                      </Box>
                    )}

                    {tabActual === "ranking" && (
                      <Ranking
                        participantes={torneoActivo.participantes}
                        todasLasPredicciones={todasLasPreds}
                        resultadosOficiales={resultadosOficiales}
                      />
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Container>
        </>
      )}
    </Box>
  );
}

export default App;
