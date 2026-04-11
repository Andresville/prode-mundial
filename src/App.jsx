import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { collection, query, onSnapshot } from "firebase/firestore";
import {
  Container,
  Button,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Avatar,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";

import Partido from "./components/Partido";
import AdminPanel from "./components/AdminPanel";
import Ranking from "./components/Ranking";
import { getDatosMundial } from "./services/api";
import { 
  guardarPrediccion, 
  obtenerMisPredicciones, 
  obtenerResultadosOficiales, 
  obtenerTodasLasPredicciones 
} from "./services/db";
import { crearTorneo, solicitarUnirse } from "./services/torneos";

function App() {
  const [user, setUser] = useState(null);
  const [torneoActivo, setTorneoActivo] = useState(null);
  const [partidos, setPartidos] = useState([]);
  const [predicciones, setPredicciones] = useState({});
  const [resultadosOficiales, setResultadosOficiales] = useState({});
  const [todasLasPreds, setTodasLasPreds] = useState({});
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setCargando(true);
        const dataPartidos = await getDatosMundial();
        setPartidos(dataPartidos);

        // Escuchar torneos en tiempo real
        const q = query(collection(db, "torneos"));
        const unsubTorneo = onSnapshot(q, async (snapshot) => {
          const torneos = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

          const miTorneo = torneos.find((t) => {
            const info = t.participantes && t.participantes[currentUser.uid];
            return info && info.estado !== "rechazado";
          });

          if (miTorneo) {
            setTorneoActivo(miTorneo);
            
            // Si está autorizado, cargamos datos propios y globales del torneo
            if (miTorneo.participantes[currentUser.uid].estado === "autorizado") {
              // Cargamos mis predicciones para los inputs
              const preds = await obtenerMisPredicciones(currentUser.uid, miTorneo.id);
              setPredicciones(preds);

              // Cargamos datos para el Ranking (Resultados oficiales y todas las predicciones)
              const [resOficiales, todasPreds] = await Promise.all([
                obtenerResultadosOficiales(),
                obtenerTodasLasPredicciones(miTorneo.id)
              ]);
              setResultadosOficiales(resOficiales);
              setTodasLasPreds(todasPreds);
            }
          } else {
            setTorneoActivo(null);
          }
          setCargando(false);
        });

        return () => unsubTorneo();
      }
    });
    return () => unsubAuth();
  }, []);

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

  const grupos = partidos.reduce((acc, p) => {
    const nombreGrupo = p.group ? p.group.replace("_", " ") : "Fase Final";
    if (!acc[nombreGrupo]) acc[nombreGrupo] = [];
    acc[nombreGrupo].push(p);
    return acc;
  }, {});

  if (cargando)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ bgcolor: "#f0f2f5", minHeight: "100vh", pb: 5 }}>
      <AppBar position="sticky" sx={{ bgcolor: "#1a237e" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            🏆 PRODE MUNDIAL
          </Typography>
          {user && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" } }}>
                {user.displayName}
              </Typography>
              <Avatar src={user.photoURL} sx={{ width: 32, height: 32 }} />
              <Button color="inherit" onClick={() => signOut(auth)}>
                Salir
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        {!user ? (
          <Box sx={{ textAlign: "center", mt: 10 }}>
            <Button variant="contained" size="large" onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}>
              Entrar con Google
            </Button>
          </Box>
        ) : !torneoActivo ? (
          <Card sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5" gutterBottom>Bienvenido, {user.displayName}</Typography>
            <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
              Crea un torneo o únete a uno de tus amigos.
            </Typography>
            <Button variant="contained" onClick={handleCrear} sx={{ m: 1 }}>Crear nuevo Torneo</Button>
            <Button variant="outlined" onClick={handleUnirse} sx={{ m: 1 }}>Unirme a uno existente</Button>
          </Card>
        ) : (
          <Box>
            {/* Panel de control para el administrador */}
            {torneoActivo.creadorId === user.uid && (
              <AdminPanel
                torneoId={torneoActivo.id}
                participantes={torneoActivo.participantes}
                partidos={partidos}
              />
            )}

            {/* Manejo de estados de acceso */}
            {torneoActivo.participantes[user.uid]?.estado === "pendiente" ? (
              <Card sx={{ p: 4, textAlign: "center", bgcolor: "#fff9c4", borderRadius: 3, border: "1px solid #fbc02d" }}>
                <Typography variant="h6">Solicitud Enviada</Typography>
                <Typography color="text.secondary">
                  Tu acceso a <b>{torneoActivo.nombre}</b> está pendiente de aprobación por el administrador.
                </Typography>
              </Card>
            ) : (
              /* PANTALLA DE JUEGO (USUARIOS AUTORIZADOS) */
              <Box>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", color: "#1a237e" }}>
                  Torneo: {torneoActivo.nombre}
                </Typography>

                {/* Mostrar el Ranking arriba de los partidos */}
                <Ranking 
                  participantes={torneoActivo.participantes} 
                  todasLasPredicciones={todasLasPreds} 
                  resultadosOficiales={resultadosOficiales} 
                />

                <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>⚽ Pronósticos</Typography>

                <Grid container spacing={3}>
                  {Object.keys(grupos).map((nombre) => (
                    <Grid item xs={12} md={6} key={nombre}>
                      <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                        <Box sx={{ bgcolor: "#d32f2f", color: "white", p: 1.5, textAlign: "center" }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                            {nombre}
                          </Typography>
                        </Box>
                        <CardContent sx={{ p: 0 }}>
                          {grupos[nombre].map((p, index) => (
                            <Partido
                              key={p.id}
                              partido={p}
                              predicciones={predicciones}
                              onInputChange={handleInputChange}
                              esUltimo={index === grupos[nombre].length - 1}
                            />
                          ))}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default App;
