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

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "beco2804@gmail.com";

function App() {
  const [user, setUser] = useState(null);
  const [esAdminMaestro, setEsAdminMaestro] = useState(false);
  const [misTorneos, setMisTorneos] = useState([]); // Nuevo: Lista de torneos del usuario
  const [torneoActivo, setTorneoActivo] = useState(null);
  const [partidos, setPartidos] = useState([]);
  const [predicciones, setPredicciones] = useState({});
  const [resultadosOficiales, setResultadosOficiales] = useState({});
  const [todasLasPreds, setTodasLasPreds] = useState({});
  const [cargando, setCargando] = useState(false);
  const [tabActual, setTabActual] = useState("partidos");

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

  // Efecto para cargar datos cuando se selecciona un torneo específico
  useEffect(() => {
    if (user && torneoActivo && torneoActivo.participantes[user.uid]?.estado === "autorizado") {
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
      alert("No se pudo guardar. Recuerda que solo puedes editar hasta 12hs antes del partido.");
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
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );

  return (
    <Box sx={{ bgcolor: "#f4f6f8", minHeight: "100vh", pb: 5 }}>
      {!user ? (
        <LoginScreen onLogin={handleLogin} />
      ) : !torneoActivo && !esAdminMaestro ? (
        /* USAMOS EL COMPONENTE SELECTOR CON LA ESTÉTICA PRO */
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
            onBack={() => setTorneoActivo(null)} // Para volver a la lista de torneos
          />

          <Container maxWidth="md" sx={{ mt: 4 }}>
            {esAdminMaestro ? (
              <Box sx={{ maxWidth: 600, mx: "auto" }}>
                <CargaResultados partidos={partidos} />
              </Box>
            ) : !torneoActivo ? (
              /* VISTA SELECTOR DE TORNEOS */
              <Card sx={{ p: 4, borderRadius: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Mis Torneos</Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>
                  Seleccioná un torneo para jugar o unite a uno nuevo.
                </Typography>

                {misTorneos.length > 0 && (
                  <List sx={{ mb: 4, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    {misTorneos.map((t) => (
                      <ListItem key={t.id} disablePadding>
                        <ListItemButton onClick={() => setTorneoActivo(t)} sx={{ borderRadius: 2, mb: 0.5 }}>
                          <ListItemText 
                            primary={t.nombre} 
                            primaryTypographyProps={{ fontWeight: 'bold' }}
                            secondary={t.participantes[user.uid].estado === 'pendiente' ? "Estado: Pendiente de aprobación" : "Entrar a jugar"}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                )}

                <Divider sx={{ my: 3 }} />

                <Grid container spacing={2} justifyContent="center">
                  <Grid item xs={12} sm={6}>
                    <Button variant="contained" fullWidth onClick={handleCrear} sx={{ py: 1.5, borderRadius: 2 }}>
                      Crear nuevo Torneo
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button variant="outlined" fullWidth onClick={handleUnirse} sx={{ py: 1.5, borderRadius: 2 }}>
                      Unirme con código
                    </Button>
                  </Grid>
                </Grid>
              </Card>
            ) : (
              /* VISTA DENTRO DEL TORNEO SELECCIONADO */
              <Box>
                {torneoActivo.creadorId === user.uid && tabActual === "partidos" && (
                  <AdminPanel
                    torneoId={torneoActivo.id}
                    participantes={torneoActivo.participantes}
                  />
                )}

                {torneoActivo.participantes[user.uid]?.estado === "pendiente" ? (
                  <Card sx={{ p: 4, textAlign: "center", bgcolor: "#fff9c4", borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>Solicitud Enviada</Typography>
                    <Typography>Esperando aprobación en <b>{torneoActivo.nombre}</b>.</Typography>
                    <Button onClick={() => setTorneoActivo(null)} sx={{ mt: 2 }}>Volver</Button>
                  </Card>
                ) : (
                  <Box>
                    {tabActual === "partidos" && (
                      <Box>
                        <Typography variant="h4" sx={{ mb: 3, fontWeight: "800", color: "#1a237e" }}>
                          Torneo: {torneoActivo.nombre}
                        </Typography>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: "400", color: "#1a237e" }}>
                          Codigo Acceso: {torneoActivo.codigoAcceso}
                        </Typography>

                        {Object.keys(estructuraGrupos).map((nombre) => (
                          <ContenedorGrupo
                            key={nombre}
                            nombre={nombre}
                            equipos={estructuraGrupos[nombre].equipos}
                            partidos={estructuraGrupos[nombre].partidos}
                            predicciones={predicciones}
                            onInputChange={handleInputChange}
                          />
                        ))}
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
