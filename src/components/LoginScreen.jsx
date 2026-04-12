import { Box, Button, Typography, Container, Paper } from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const LoginScreen = ({ onLogin }) => {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'radial-gradient(circle at center, #1a237e 0%, #0d47a1 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Círculos decorativos de fondo */}
      <Box sx={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
      <Box sx={{ position: 'absolute', bottom: '-5%', left: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

      <Container maxWidth="sm">
        <Paper 
          elevation={24} 
          sx={{ 
            p: { xs: 4, md: 6 }, 
            textAlign: 'center', 
            borderRadius: 5, 
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 80, color: '#ffd700', mb: 2 }} />
          
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#1a237e', mb: 1, letterSpacing: -1 }}>
            PRODE MUNDIAL
          </Typography>
          
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 5, fontSize: '1.1rem' }}>
            Demostrá tus conocimientos, armá tu grupo con amigos y viví la pasión del mundial.
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={onLogin}
            sx={{
              bgcolor: '#000',
              color: '#fff',
              px: 4,
              py: 2,
              borderRadius: 3,
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#333',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Ingresar con Google
          </Button>

          <Typography variant="caption" sx={{ display: 'block', mt: 4, color: 'text.disabled' }}>
            © 2026 Prode Mundial Amigos - Todos los derechos reservados
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginScreen;