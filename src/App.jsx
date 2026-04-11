import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  Container, Button, Typography, Box, AppBar, Toolbar, 
  Avatar, Grid, Card, CardContent, CircularProgress 
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

// Componentes y Servicios
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
        cargarTodo(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const cargarTodo = async (userId) => {
    setCargando(true);
    try {
      const [dataPartidos, dataPredicciones] = await Promise.all([
        getDatosMundial(),
        obtenerMisPredicciones(userId)
      ]);
      
      setPartidos(dataPartidos);
      setPredicciones(dataPredicciones);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setCargando(false);
    }
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
    const nombreGrupo = p.group ? p.group.replace('_', ' ') : 'Fase Final';
    if (!acc[nombreGrupo]) acc[nombreGrupo] = [];
    acc[nombreGrupo].push(p);
    return acc;
  }, {});

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f0f2f5', minHeight: '100vh', pb: 5 }}>
      <AppBar position="sticky" sx={{ backgroundColor: '#1a237e' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            🏆 PRODE MUNDIAL
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar src={user.photoURL} sx={{ width: 32, height: 32 }} />
              <Button color="inherit" onClick={() => signOut(auth)}>Salir</Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 } }}>
        {!user ? (
          <Box sx={{ mt: 10, textAlign: 'center', p: 4, bgcolor: 'white', borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: '#1a237e' }}>
              ¡Hola Andres!
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<GoogleIcon />} 
              onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
              size="large"
            >
              Entrar con Google
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', textAlign: { xs: 'center', md: 'left' } }}>
              Partidos del Mundial
            </Typography>

            {cargando ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {Object.keys(grupos).map((nombre) => (
                  <Grid item xs={12} md={6} key={nombre}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                      <Box sx={{ bgcolor: '#d32f2f', color: 'white', p: 1.5, textAlign: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
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
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default App;