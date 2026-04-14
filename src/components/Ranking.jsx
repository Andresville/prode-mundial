import { Card, CardContent, Typography, Grid, Avatar, Box } from '@mui/material';
import { calcularPuntos } from '../services/db';

const Ranking = ({ participantes, todasLasPredicciones, resultadosOficiales }) => {
  
  const rankingData = Object.entries(participantes || {}).map(([uid, info]) => {
    let totalPuntos = 0;
    const userPreds = todasLasPredicciones[uid] || {};

    Object.values(resultadosOficiales).forEach((resReal) => {
      const predUsuario = {
        golesL: userPreds[`${resReal.partidoId}_L`],
        golesV: userPreds[`${resReal.partidoId}_V`]
      };

      if (predUsuario.golesL !== undefined && predUsuario.golesV !== undefined) {
        totalPuntos += calcularPuntos(predUsuario, {
          golesL: resReal.golesLocal,
          golesV: resReal.golesVisitante
        });
      }
    });

    return {
      id: uid,
      nombre: info.nombre,
      photo: info.foto,
      puntos: totalPuntos
    };
  });

  const rankingOrdenado = rankingData.sort((a, b) => b.puntos - a.puntos);

  return (
    <Box sx={{ mt: 5, mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>📊 Posiciones del Grupo</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {rankingOrdenado.map((u, i) => (
            <Grid 
              container 
              key={u.id} 
              sx={{ 
                px: 2, 
                py: 1.5, 
                alignItems: 'center', 
                borderBottom: i === rankingOrdenado.length - 1 ? 'none' : '1px solid #eee',
                bgcolor: i === 0 ? 'rgba(255, 215, 0, 0.05)' : 'transparent'
              }}
            >
              <Grid item xs={2}>
                <Typography sx={{ fontWeight: i < 3 ? 'bold' : 'normal' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}°`}
                </Typography>
              </Grid>
              <Grid item xs={7} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar src={u.photo} sx={{ width: 30, height: 30 }} />
                <Typography variant="body2" sx={{ fontWeight: i === 0 ? 'bold' : 'normal' }}>
                  {u.nombre}
                </Typography>
              </Grid>
              <Grid item xs={3} sx={{ textAlign: 'center', fontWeight: 'bold', color: '#1a237e', fontSize: '1.1rem' }}>
                {u.puntos}
              </Grid>
            </Grid>
          ))}

          {rankingOrdenado.length === 0 && (
            <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              Esperando que comiencen los partidos...
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Ranking;
