import { Box, Typography, Card } from '@mui/material';
import Partido from './Partido';

const ContenedorGrupo = ({ nombre, equipos, partidos, predicciones, onInputChange }) => {
  return (
    <Card sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <Box sx={{ 
        bgcolor: '#1a237e', 
        color: 'white', 
        p: 1.5, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: 'center',
        gap: 1
      }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
          {nombre}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          {equipos.map((eq) => (
            <Box 
              key={eq.name} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5, 
                bgcolor: 'rgba(255,255,255,0.1)', 
                px: 1, 
                py: 0.2, 
                borderRadius: 1 
              }}
            >
              <img src={eq.crest} alt="" style={{ width: '18px', height: 'auto' }} />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                {eq.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ bgcolor: 'white' }}>
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
    </Card>
  );
};

export default ContenedorGrupo;
