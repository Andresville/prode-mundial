import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Divider, Button } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock'; // Asegúrate de tener esta importación
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

  const handleSetGoles = (val, setter) => {
    if (val === "" || (Number(val) >= 0 && !val.includes('-'))) {
      setter(val);
    }
  };

  const handleAction = () => {
    if (estaBloqueado) return;
    if (golesL !== "" && golesV !== "") {
      onInputChange(partido.id, golesL, golesV, partido.utcDate);
    } else {
        alert("Por favor, completa ambos marcadores antes de guardar.");
    }
  };

  const inputSx = { 
    width: { xs: 35, md: 50 }, 
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    '& input': { 
      textAlign: 'center', 
      padding: { xs: '4px', md: '8px' }, 
      fontSize: { xs: '0.8rem', md: '0.85rem' },
      '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
        display: 'none',
        margin: 0,
      },
      MozAppearance: 'textfield',
    } 
  };

  return (
    <Box>
      <Box sx={{ 
        p: { xs: 1, md: 2 }, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        opacity: estaBloqueado ? 0.8 : 1,
        gap: 0.5
      }}>
        <Box sx={{ width: { xs: '20%', sm: '25%' }, textAlign: 'center' }}>
          <Box component="img" src={partido.homeTeam.crest} sx={{ width: { xs: 22, md: 35 }, mb: 0.5 }} />
          <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', fontSize: { xs: '0.65rem', md: '0.9rem' } }}>
            {partido.homeTeam.name}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="caption" color={estaBloqueado ? "error" : "text.secondary"} sx={{ fontSize: { xs: '0.6rem', md: '0.8rem' }, display: 'block', mb: 0.5 }}>
            {estaBloqueado ? "🔒 CERRADO" : format(fechaPartido, "dd/MM HH:mm", { locale: es })}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
            <TextField 
              size="small" value={golesL} disabled={estaBloqueado}
              onChange={(e) => handleSetGoles(e.target.value, setGolesL)}
              sx={inputSx}
              slotProps={{ htmlInput: { type: 'number', inputMode: 'numeric', min: 0 } }}
            />
            <Typography sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', md: '1.2rem' } }}>-</Typography>
            <TextField 
              size="small" value={golesV} disabled={estaBloqueado}
              onChange={(e) => handleSetGoles(e.target.value, setGolesV)}
              sx={inputSx}
              slotProps={{ htmlInput: { type: 'number', inputMode: 'numeric', min: 0 } }}
            />
          </Box>
        </Box>
        <Box sx={{ width: { xs: '20%', sm: '25%' }, textAlign: 'center' }}>
          <Box component="img" src={partido.awayTeam.crest} sx={{ width: { xs: 22, md: 35 }, mb: 0.5 }} />
          <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', fontSize: { xs: '0.65rem', md: '0.9rem' } }}>
            {partido.awayTeam.name}
          </Typography>
        </Box>
        <Box sx={{ width: { xs: '50px', md: '90px' }, textAlign: 'right' }}>
          <Button
            variant={huboCambios ? "contained" : "outlined"}
            color={huboCambios ? "success" : "primary"}
            size="small"
            onClick={handleAction}
            disabled={(estaBloqueado && !yaTieneDatos) || golesL === "" || golesV === ""}
            sx={{ 
              minWidth: { xs: '40px', md: '85px' }, 
              height: { md: '45px' },
              fontSize: { xs: '0.6rem', md: '0.8rem' },
              fontWeight: 900
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