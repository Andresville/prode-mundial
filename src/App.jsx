import { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { 
  Container, Button, Typography, Box, AppBar, Toolbar, 
  Avatar, Grid, Card, CardContent, CircularProgress 
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

// Importamos nuestro componente nuevo
import Partido from './components/Partido';

const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY;
const BASE_URL = 'https://cors-anywhere.herokuapp.com/https://api.football-data.org/v4';

function App() {
  const [user, setUser] = useState(null);
  const [partidos, setPartidos] = useState([]);
  const [predicciones, setPredicciones] = useState({});
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        traerPartidos();
        cargarPrediccionesUsuario(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const traerPartidos = async () => {
    setCargando(true);
    try {
      const response = await fetch(`${BASE_URL}/competitions/WC/matches`, {
        headers: { 'X-Auth-Token': API_KEY }
      });
      const data = await response.json();
      if (data.matches && data.matches.length > 0) {
        setPartidos(data.matches);
      } else { throw new Error(); }
    } catch (error) {
      // Datos de prueba por si falla la API
      setPartidos([
        { id: 1, group: 'GRUPO A', utcDate: '2026-06-10T18:00:00Z', homeTeam: { name: 'Argentina', crest: 'https://crests.football-data.org/762.png' }, awayTeam: { name: 'Francia', crest: 'https://crests.football-data.org/773.svg' } },
        { id: 2, group: 'GRUPO A', utcDate: '2026-06-11T20:00:00Z', homeTeam: { name: 'España', crest: 'https://crests.football-data.org/760.svg' }, awayTeam: { name: 'Alemania', crest: 'https://crests.football-data.org/759.svg' } },
        { id: 3, group: 'GRUPO B', utcDate: '2026-06-12T15:00:00Z', homeTeam: { name: 'Brasil', crest: 'https://crests.football-data.org/764.svg' }, awayTeam: { name: 'Portugal', crest: 'https://crests.football-data.org/765.svg' } }
      ]);
    } finally { setCargando(false); }
  };

  const cargarPrediccionesUsuario = async (userId) => {
    const q = query(collection(db, "predicciones"), where("userId", "==", userId));
    const snap = await getDocs(q);
    const predsGuardadas = {};
    snap.forEach((doc) => {
      const data = doc.data();
      predsGuardadas[`${data.partidoId}_L`] = data.golesLocal;
      predsGuardadas[`${data.partidoId}_V`] = data.golesVisitante;
    });
    setPredicciones(predsGuardadas);
  };

  const handleInputChange = async (partidoId, lado, valor, fecha) => {
    const nuevaPred = { ...predicciones, [`${partidoId}_${lado}`]: valor };
    setPredicciones(nuevaPred);
    
    const gL = nuevaPred[`${partidoId}_L`];
    const gV = nuevaPred[`${partidoId}_V`];

    // Solo guarda si ambos campos tienen valor
    if (gL !== undefined && gV !== undefined && gL !== "" && gV !== "") {
      const doceHoras = 12 * 60 * 60 * 1000;
      if ((new Date(fecha) - new Date()) > doceHoras) {
        try {
          await setDoc(doc(db, "predicciones", `${user.uid}_${partidoId}`), {
            userId: user.uid,
            partidoId,
            golesLocal: parseInt(gL),
            golesVisitante: parseInt(gV),
            fecha: new Date()
          });
        } catch (e) { console.error(e); }
      }
    }
  };

  const grupos = partidos.reduce((acc, p) => {
    const n = p.group ? p.group.replace('_', ' ') : 'Fase Final';
    if (!acc[n]) acc[n] = [];
    acc[n].push(p);
    return acc;
  }, {});

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f0f2f5', minHeight: '100vh', pb: 5 }}>
      <AppBar position="sticky" sx={{ backgroundColor: '#1a237e' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>🏆 PRODE MUNDIAL</Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar src={user.photoURL} sx={{ width: 30, height: 30 }} />
              <Button color="inherit" onClick={() => signOut(auth)}>Salir</Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {!user ? (
          <Box sx={{ mt: 10, textAlign: 'center', p: 4, bgcolor: 'white', borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>¡Hola Andres!</Typography>
            <Button variant="contained" startIcon={<GoogleIcon />} onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}>
              Entrar con Google
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Partidos del Mundial</Typography>
            {cargando ? <CircularProgress sx={{ display: 'block', m: 'auto' }} /> : (
              <Grid container spacing={3}>
                {Object.keys(grupos).map((nombre) => (
                  <Grid key={nombre} size={{ xs: 12, md: 6 }}>
                    <Card sx={{ borderRadius: 2 }}>
                      <Box sx={{ bgcolor: '#d32f2f', color: 'white', p: 1, textAlign: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{nombre}</Typography>
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
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default App;