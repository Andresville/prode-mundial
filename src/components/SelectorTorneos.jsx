import { Box, Paper, Typography, Button, List, ListItem, ListItemButton, ListItemText, Divider, Container } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import copaImg from "../assets/foto login.jpg";

const SelectorTorneos = ({ torneos, onSeleccionar, onCrear, onUnirse, user }) => {
  return (
    <Box 
      sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#333', 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${copaImg})`,
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
            p: { xs: 3, md: 4 }, 
            textAlign: 'center', 
            borderRadius: 6, 
            background: 'rgba(255, 255, 255, 0.12)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            color: '#fff',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 900, 
              mb: 1, 
              letterSpacing: -1,
              textTransform: 'uppercase',
              background: 'linear-gradient(to bottom, #ffffff, #ffd700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            MIS TORNEOS
          </Typography>

          <Typography variant="body2" sx={{ mb: 3, opacity: 0.8, fontWeight: 300 }}>
            Elegí tu competencia o sumate a una nueva.
          </Typography>
          <List 
            sx={{ 
              mb: 2, 
              maxHeight: '300px', 
              overflowY: 'auto',
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-thumb': { background: 'rgba(255,215,0,0.3)', borderRadius: '10px' }
            }}
          >
            {torneos.map((t) => (
              <ListItem key={t.id} disablePadding sx={{ mb: 1.5 }}>
                <ListItemButton 
                  onClick={() => onSeleccionar(t)}
                  sx={{ 
                    background: 'rgba(255,255,255,0.35)', 
                    borderRadius: 3,
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: '0.3s',
                    '&:hover': { 
                      background: 'rgba(255,255,255,0.15)',
                      transform: 'scale(1.02)',
                      borderColor: '#ffd700'
                    } 
                  }}
                >
                  <ListItemText 
                    primary={t.nombre} 
                    secondary={
                      t.participantes[user?.uid]?.estado === 'pendiente' 
                      ? "⏳ Pendiente de aprobación" 
                      : `🏆 ${Object.keys(t.participantes).length} Participantes`
                    }
                    primaryTypographyProps={{ fontWeight: 700, fontSize: '1.1rem' }}
                    secondaryTypographyProps={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.15)', my: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button 
              variant="contained" 
              fullWidth 
              startIcon={<GroupAddIcon />}
              onClick={onUnirse}
              sx={{ 
                bgcolor: '#fff', 
                color: '#000', 
                fontWeight: 700,
                borderRadius: 3,
                py: 1.2,
                '&:hover': { bgcolor: '#f5f5f5', transform: 'translateY(-2px)' }
              }}
            >
              Unirme con código
            </Button>
            
            <Button 
              variant="outlined" 
              fullWidth 
              startIcon={<AddIcon />}
              onClick={onCrear}
              sx={{ 
                color: '#ffd700', 
                borderColor: 'rgba(255,215,0,0.5)',
                fontWeight: 600,
                borderRadius: 3,
                py: 1.2,
                '&:hover': { 
                  borderColor: '#ffd700', 
                  background: 'rgba(255,215,0,0.05)',
                  transform: 'translateY(-2px)' 
                }
              }}
            >
              Crear nuevo torneo
            </Button>
          </Box>

          <Typography variant="caption" sx={{ display: 'block', mt: 3, opacity: 0.5, fontWeight: 300 }}>
            PRODE MUNDIAL • LA GLORIA TE ESPERA
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default SelectorTorneos;
