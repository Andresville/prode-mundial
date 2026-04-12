import { AppBar, Toolbar, Typography, Box, Avatar, Button, Container } from "@mui/material";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'; // Icono de Copa

const Header = ({ user, esAdminMaestro }) => {
  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: esAdminMaestro 
          ? "linear-gradient(90deg, #000000 0%, #434343 100%)" 
          : "linear-gradient(90deg, #1a237e 0%, #283593 100%)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEventsIcon sx={{ color: '#ffd700', fontSize: 32, filter: 'drop-shadow(0 0 5px rgba(255,215,0,0.5))' }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 900, 
                letterSpacing: -0.5, 
                fontFamily: "'Roboto Condensed', sans-serif",
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {esAdminMaestro ? "PANEL MAESTRO" : "PRODE MUNDIAL"}
            </Typography>
          </Box>

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                <Typography variant="caption" sx={{ display: 'block', opacity: 0.8, lineHeight: 1 }}>
                  Bienvenido,
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {user.displayName}
                </Typography>
              </Box>
              <Avatar 
                src={user.photoURL} 
                sx={{ width: 38, height: 38, border: '2px solid rgba(255,255,255,0.2)' }} 
              />
              <Button 
                variant="outlined" 
                color="inherit" 
                size="small"
                onClick={() => signOut(auth)}
                sx={{ borderRadius: 2, textTransform: 'none', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                Salir
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;