import { useEffect, useState } from 'react';
import { getDatosMundial } from '../services/api';
import { 
  Grid, Card, CardContent, Typography, Box, Divider 
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ListaPartidos = () => {
  const [partidos, setPartidos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDatosMundial();
      setPartidos(data);
    };
    fetchData();
  }, []);

  // Agrupamos los partidos por Grupo
  const grupos = partidos.reduce((acc, partido) => {
    const grupo = partido.group || 'Fase Final';
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(partido);
    return acc;
  }, {});

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={4}>
        {Object.keys(grupos).map((nombreGrupo) => (
          <Grid item xs={12} md={6} key={nombreGrupo}>
            <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
              <Box sx={{ bgcolor: '#1a237e', color: 'white', p: 1, textAlign: 'center' }}>
                <Typography variant="h6">{nombreGrupo.replace('_', ' ')}</Typography>
              </Box>
              <CardContent>
                {grupos[nombreGrupo].map((partido) => (
                  <Box key={partido.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {/* Equipo Local */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <img src={partido.homeTeam.crest} alt="" style={{ width: 24, height: 16, objectFit: 'contain' }} />
                        <Typography variant="body2">{partido.homeTeam.name}</Typography>
                      </Box>

                      {/* VS / Inputs */}
                      <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {format(new Date(partido.utcDate), "d 'de' MMM - HH:mm", { locale: es })}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 1 }}>
                          {/* Aquí irán los inputs para el Prode más adelante */}
                          <Typography variant="h6">vs</Typography>
                        </Box>
                      </Box>

                      {/* Equipo Visitante */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, justifyContent: 'flex-end' }}>
                        <Typography variant="body2">{partido.awayTeam.name}</Typography>
                        <img src={partido.awayTeam.crest} alt="" style={{ width: 24, height: 16, objectFit: 'contain' }} />
                      </Box>
                    </Box>
                    <Divider sx={{ mt: 1 }} />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ListaPartidos;