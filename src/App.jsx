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
  Card,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";

import AdminPanel from "./components/AdminPanel";
import Ranking from "./components/Ranking";
import CargaResultados from "./components/CargaResultados";
import ContenedorGrupo from "./components/ContenedorGrupo"; // Asegúrate de crear este archivo
import { getDatosMundial } from "./services/api";
import { 
  guardarPrediccion, 
  obtenerMisPredicciones, 
  obtenerResultadosOficiales, 
  obtenerTodasLasPredicciones 
} from "./services/db";
import { crearTorneo, solicitarUnirse } from "./services/torneos";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "beco2804@gmail.com";

function App() {
  const [user, setUser] = useState(null);
  const [esAdminMaestro, setEsAdminMaestro] = useState(false);
  const [torneoActivo, setTorneoActivo] = useState(null);
  const [partidos, setPartidos] = useState([]);
  const [predicciones, setPredicciones] = useState({});
  const [resultadosOficiales, setResultadosOficiales] = useState({});
  const [todasLasPreds, setTodasLasPreds] = useState({});
  const [cargando, setCargando] = useState(false);
  const [tabActual, setTabActual] = useState(0); // 0: Partidos, 1: Posiciones

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
        const unsubTorneo = onSnapshot(q, async (snapshot) => {
          const torneos = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

          const miTorneo = torneos.find((t) => {
            const info = t.participantes && t.participantes[currentUser.uid];
            return info && info.estado !== "rechazado";
          });

          if (miTorneo) {
            setTorneoActivo(miTorneo);
            
            if (miTorneo.participantes[currentUser.uid].estado === "autorizado") {
              const preds = await obtenerMisPredicciones(currentUser.uid, miTorneo.id);
              setPredicciones(preds);

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

  // --- LÓGICA DE AGRUPACIÓN PARA EL NUEVO DISEÑO ---
  const estructuraGrupos = partidos.reduce((acc, p) => {
    const nombreGrupo = p.group ? p.group.replace("_", " ") : "Fase Final";
    if (!acc[nombreGrupo]) acc[nombreGrupo] = { partidos: [], equipos: [] };
    
    acc[nombreGrupo].partidos.push(p);
    
    // Guardar equipos únicos para las banderas del encabezado
    [p.homeTeam, p.awayTeam].forEach(team => {
      if (!acc[nombreGrupo].equipos.find(e => e.name === team.name)) {
        acc[nombreGrupo].equipos.push(team);
      }
    });
    return acc;
  }, {});

  if (cargando)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ bgcolor: "#f4f6f8", minHeight: "100vh", pb: 5 }}>
      <AppBar position="sticky" sx={{ bgcolor: esAdminMaestro ? "#000" : "#1a237e", boxShadow: 0 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            {esAdminMaestro ? "🛠️ PANEL MAESTRO" : "🏆 PRODE MUNDIAL"}
          </Typography>
          {user && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" } }}>
                {user.displayName}
              </Typography>
              <Avatar src={user.photoURL} sx={{ width: 32, height: 32, border: '1px solid white' }} />
              <Button color="inherit" onClick={() => signOut(auth)}>Salir</Button>
            </Box>
          )}
        </Toolbar>

        {/* --- PESTAÑAS (Solo para jugadores autorizados) --- */}
        {!esAdminMaestro && torneoActivo?.participantes[user?.uid]?.estado === "autorizado" && (
          <Tabs 
            value={tabActual} 
            onChange={(e, val) => setTabActual(val)} 
            centered 
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ bgcolor: '#1a237e' }}
          >
            <Tab label="⚽ Partidos" />
            <Tab label="📊 Posiciones" />
          </Tabs>
        )}
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {!user ? (
          <Box sx={{ textAlign: "center", mt: 10 }}>
            <Button variant="contained" size="large" onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}>
              Entrar con Google
            </Button>
          </Box>
        ) : esAdminMaestro ? (
          <Box sx={{ maxWidth: 600, mx: "auto" }}>
            <CargaResultados partidos={partidos} />
          </Box>
        ) : !torneoActivo ? (
          <Card sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
            <Typography variant="h5" gutterBottom>Bienvenido, {user.displayName}</Typography>
            <Button variant="contained" onClick={handleCrear} sx={{ m: 1 }}>Crear nuevo Torneo</Button>
            <Button variant="outlined" onClick={handleUnirse} sx={{ m: 1 }}>Unirme a uno existente</Button>
          </Card>
        ) : (
          <Box>
            {/* Panel de Dueño (Solo se muestra en la pestaña de partidos o arriba de todo) */}
            {torneoActivo.creadorId === user.uid && tabActual === 0 && (
              <AdminPanel torneoId={torneoActivo.id} participantes={torneoActivo.participantes} />
            )}

            {torneoActivo.participantes[user.uid]?.estado === "pendiente" ? (
              <Card sx={{ p: 4, textAlign: "center", bgcolor: "#fff9c4", borderRadius: 3 }}>
                <Typography variant="h6">Solicitud Enviada</Typography>
                <Typography>Esperando aprobación en <b>{torneoActivo.nombre}</b>.</Typography>
              </Card>
            ) : (
              <Box>
                {/* --- CONTENIDO PESTAÑA 0: PARTIDOS --- */}
                {tabActual === 0 && (
                  <Box>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: "800", color: "#1a237e" }}>
                      Torneo: {torneoActivo.nombre}
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

                {/* --- CONTENIDO PESTAÑA 1: POSICIONES --- */}
                {tabActual === 1 && (
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
    </Box>
  );
}

export default App;