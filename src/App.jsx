import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { Container, Button, Typography, Box, AppBar, Toolbar, Avatar, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

// Componentes y Servicios Propios
import Partido from './components/Partido';
import { getDatosMundial } from './services/api';
import { guardarPrediccion, obtenerMisPredicciones } from './services/db';

function App() {
  const [user, setUser] = useState(null);
  const [partidos, setPartidos] = useState([]);
  const [predicciones, setPredicciones] = useState({});
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        cargarDatos(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const cargarDatos = async (userId) => {
    setCargando(true);
    const [dataPartidos, dataPredicciones] = await Promise.all([
      getDatosMundial(),
      obtenerMisPredicciones(userId)
    ]);
    
    // Si la API falla, getDatosMundial ya debería devolver el mock en su servicio
    setPartidos(dataPartidos.length > 0 ? dataPartidos : partidosDePrueba);
    setPredicciones(dataPredicciones);
    setCargando(false);
  };

  const handleInputChange = async (partidoId, lado, valor, fecha) => {
    const nuevaPred = { ...predicciones, [`${partidoId}_${lado}`]: valor };
    setPredicciones(nuevaPred);
    
    const gL = nuevaPred[`${partidoId}_L`];
    const gV = nuevaPred[`${partidoId}_V`];

    if (gL !== "" && gV !== "" && gL !== undefined && gV !== undefined) {
      await guardarPrediccion(user.uid, partidoId, gL, gV, fecha);
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

      <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 } }}>
        {!user ? (
          <Box sx={{ mt: 10, textAlign: 'center', p: 4, bgcolor: 'white', borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>¡Hola Andres!</Typography>
            <Button variant="contained" startIcon={<GoogleIcon />} onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}>
              Entrar con Google
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
              Partidos del Mundial
            </Typography>
            {cargando ? <CircularProgress sx={{ display: 'block', m: 'auto' }} /> : (
              <Grid container spacing={2}>
                {Object.keys(grupos).map((nombre) => (
                  <Grid item xs={12} md={6} key={nombre}>
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

// Mover los partidos de prueba a una constante fuera para limpiar el código
const partidosDePrueba = [
  { id: 1, group: 'GRUPO A', utcDate: '2026-06-10T18:00:00Z', homeTeam: { name: 'Argentina', crest: 'https://crests.football-data.org/762.png' }, awayTeam: { name: 'Francia', crest: 'https://crests.football-data.org/773.svg' } },
  { id: 2, group: 'GRUPO A', utcDate: '2026-06-11T20:00:00Z', homeTeam: { name: 'España', crest: 'https://crests.football-data.org/760.svg' }, awayTeam: { name: 'Alemania', crest: 'https://crests.football-data.org/759.svg' } },
  { id: 3, group: 'GRUPO B', utcDate: '2026-06-12T15:00:00Z', homeTeam: { name: 'Brasil', crest: 'https://crests.football-data.org/764.svg' }, awayTeam: { name: 'Portugal', crest: 'https://crests.football-data.org/765.svg' } }
];

export default App;