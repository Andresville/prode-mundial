import { Box, Typography, Paper } from '@mui/material';
import Partido from './Partido';

const ContenedorGrupo = ({ nombre, partidos, predicciones, onInputChange }) => {
  return (
    <Paper elevation={0} sx={{ 
      borderRadius: 5, overflow: 'hidden',
      background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white'
    }}>
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffd700', letterSpacing: 1 }}>
          {nombre.toUpperCase()}
        </Typography>
      </Box>

      <Box sx={{ p: { xs: 0.5, sm: 1 } }}>
        {partidos.map((p, index) => (
          <Partido
            key={p.id}
            partido={p}
            predicciones={predicciones}
            onInputChange={onInputChange}
            esUltimo={index === partidos.length - 1}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default ContenedorGrupo;
