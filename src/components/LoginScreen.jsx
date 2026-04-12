import { Box, Button, Typography, Container, Paper } from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';
import copaImg from "../assets/foto login.jpg"; // Asegúrate de que la ruta sea correcta

const LoginScreen = ({ onLogin }) => {
  return (
    <Box 
      sx={{ 
        // Usamos fixed y 100vh/100vw para anular cualquier margen del body o padres
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Fondo GRIS de base para que no exista el blanco
        backgroundColor: '#333', 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4)), url(${copaImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="xs">
        <Paper 
          elevation={24} 
          sx={{ 
            p: { xs: 4, md: 5 }, 
            textAlign: 'center', 
            borderRadius: 6, 
            // Efecto Glassmorphism
            background: 'rgba(255, 255, 255, 0.12)', 
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            color: '#fff'
          }}
        >
          {/* Logo o Título con estilo Pro */}
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 900, 
              mb: 1, 
              letterSpacing: -1,
              textTransform: 'uppercase',
              background: 'linear-gradient(to bottom, #ffffff, #ffd700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}
          >
            PRODE MUNDIAL
          </Typography>
          
          <Typography variant="h6" sx={{ fontWeight: 300, mb: 4, opacity: 0.9 }}>
            La copa se juega entre amigos.
          </Typography>

          <Box sx={{ my: 4 }}>
            <Typography variant="body1" sx={{ mb: 4, color: 'rgba(255,255,255,0.8)' }}>
              Unite a la competencia, demostrá quién sabe más y llevate la gloria.
            </Typography>

            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={onLogin}
              sx={{
                bgcolor: '#fff',
                color: '#000',
                py: 1.8,
                borderRadius: 4,
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.4)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Continuar con Google
            </Button>
          </Box>

          <Typography variant="caption" sx={{ display: 'block', mt: 4, opacity: 0.6, fontWeight: 300 }}>
            © 2026 PRODE MUNDIAL • PASIÓN Y AMISTAD
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginScreen;