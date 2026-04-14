import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Divider, Button } from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Partido = ({ partido, predicciones, onInputChange, esUltimo }) => {
  const [golesL, setGolesL] = useState(predicciones[`${partido.id}_L`] ?? '');
  const [golesV, setGolesV] = useState(predicciones[`${partido.id}_V`] ?? '');
  
  useEffect(() => {
    setGolesL(predicciones[`${partido.id}_L`] ?? '');
    setGolesV(predicciones[`${partido.id}_V`] ?? '');
  }, [predicciones, partido.id]);

  const fechaPartido = new Date(partido.utcDate);
  const ahora = new Date();
  const estaBloqueado = (fechaPartido - ahora) / (1000 * 60 * 60) < 12;

  const vGL = predicciones[`${partido.id}_L`];
  const vGV = predicciones[`${partido.id}_V`];
  const yaTieneDatos = vGL !== undefined && vGV !== undefined;
  const huboCambios = String(golesL) !== String(vGL ?? '') || String(golesV) !== String(vGV ?? '');

  const handleAction = () => {
    if (estaBloqueado) return;
    if (golesL !== "" && golesV !== "") onInputChange(partido.id, golesL, golesV, partido.utcDate);
  };

  return (
    <Box>
      <Box sx={{ 
        p: { xs: 1, sm: 1.5 }, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        opacity: estaBloqueado ? 0.8 : 1,
        gap: 0.5
      }}>
        
        <Box sx={{ width: { xs: '20%', sm: '25%' }, textAlign: 'center' }}>
          <img src={partido.homeTeam.crest} width="22" alt="" style={{ marginBottom: '2px' }} />
          <Typography variant="caption"
           sx={{ display: 'block', 
           fontWeight: 'bold', 
           fontSize: { xs: '0.65rem', sm: '0.75rem' }, 
           lineHeight: 1 }}>
            {partido.homeTeam.name}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="caption"
          color={estaBloqueado ? "error" : "text.secondary"} 
          sx={{ fontSize: '0.6rem', display: 'block', mb: 0.5 }}>
            {estaBloqueado ? "🔒 CERRADO" : format(fechaPartido, "dd/MM HH:mm", { locale: es })}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
            <TextField 
              size="small" value={golesL} disabled={estaBloqueado}
              onChange={(e) => setGolesL(e.target.value)}
              sx={{ width: 35, '& input': { textAlign: 'center', padding: '4px', fontSize: '0.8rem' } }}
              slotProps={{ htmlInput: { type: 'number', inputMode: 'numeric' } }}
            />
            <Typography sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>-</Typography>
            <TextField 
              size="small" value={golesV} disabled={estaBloqueado}
              onChange={(e) => setGolesV(e.target.value)}
              sx={{ width: 35, '& input': { textAlign: 'center', padding: '4px', fontSize: '0.8rem' } }}
              slotProps={{ htmlInput: { type: 'number', inputMode: 'numeric' } }}
            />
          </Box>
        </Box>

        <Box sx={{ width: { xs: '20%', sm: '25%' }, textAlign: 'center' }}>
          <img src={partido.awayTeam.crest} width="22" alt="" style={{ marginBottom: '2px' }} />
          <Typography variant="caption" 
          sx={{ display: 'block', 
          fontWeight: 'bold', 
          fontSize: { xs: '0.65rem', sm: '0.75rem' }, 
          lineHeight: 1 }}>
            {partido.awayTeam.name}
          </Typography>
        </Box>

        <Box sx={{ width: { xs: '50px', sm: '90px' }, textAlign: 'right' }}>
          <Button
            variant={huboCambios ? "contained" : "outlined"}
            color={huboCambios ? "success" : "primary"}
            size="small"
            onClick={handleAction}
            disabled={estaBloqueado && !yaTieneDatos}
            sx={{ 
              minWidth: { xs: '40px', sm: '85px' }, 
              fontSize: { xs: '0.6rem', sm: '0.7rem' },
              p: { xs: '4px 0', sm: '4px 8px' }
            }}
          >
            {estaBloqueado ? <LockIcon fontSize="inherit" /> : (huboCambios ? "OK" : "EDIT")}
          </Button>
        </Box>

      </Box>
      {!esUltimo && <Divider sx={{ mx: 2, opacity: 0.5 }} />}
    </Box>
  );
};

export default Partido;
