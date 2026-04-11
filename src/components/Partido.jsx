import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Divider, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Partido = ({ partido, predicciones, onInputChange, esUltimo }) => {
  // Estados locales para los inputs
  const [golesL, setGolesL] = useState(predicciones[`${partido.id}_L`] ?? '');
  const [golesV, setGolesV] = useState(predicciones[`${partido.id}_V`] ?? '');
  
  // Sincronizar con la base de datos al cargar
  useEffect(() => {
    setGolesL(predicciones[`${partido.id}_L`] ?? '');
    setGolesV(predicciones[`${partido.id}_V`] ?? '');
  }, [predicciones, partido.id]);

  // --- LÓGICA DE BLOQUEO (12 HORAS) ---
  const fechaPartido = new Date(partido.utcDate);
  const ahora = new Date(); // si quiero pobra como se bloquea '2026-06-11T10:00:00Z'

  const diferenciaHoras = (fechaPartido - ahora) / (1000 * 60 * 60);
  const estaBloqueado = diferenciaHoras < 12;

  // --- LÓGICA DE BOTONES ---
  const valorGuardadoL = predicciones[`${partido.id}_L`];
  const valorGuardadoV = predicciones[`${partido.id}_V`];
  
  const yaTieneDatosEnDB = valorGuardadoL !== undefined && valorGuardadoV !== undefined;
  
  // Detectar si el usuario cambió los números respecto a lo que hay en la DB
  const huboCambios = String(golesL) !== String(valorGuardadoL ?? '') || 
                     String(golesV) !== String(valorGuardadoV ?? '');

  const handleAction = () => {
    if (estaBloqueado) return;
    
    if (golesL !== "" && golesV !== "") {
      onInputChange(partido.id, golesL, golesV, partido.utcDate);
    } else {
      alert("Por favor, completa ambos campos.");
    }
  };

  return (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, opacity: estaBloqueado ? 0.7 : 1 }}>
        
        {/* Local */}
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <img src={partido.homeTeam.crest} width="25" alt="" />
          <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
            {partido.homeTeam.name}
          </Typography>
        </Box>

        {/* Centro */}
        <Box sx={{ flex: 2, textAlign: 'center' }}>
          <Typography variant="caption" color={estaBloqueado ? "error" : "text.secondary"} sx={{ fontSize: '0.7rem', fontWeight: estaBloqueado ? 'bold' : 'normal' }}>
            {estaBloqueado ? "🔒 CERRADO" : format(fechaPartido, "dd MMM - HH:mm", { locale: es })}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <TextField 
              size="small" 
              value={golesL}
              disabled={estaBloqueado}
              onChange={(e) => setGolesL(e.target.value)}
              sx={{ width: 40, '& input': { textAlign: 'center', padding: '4px' } }}
              slotProps={{ htmlInput: { type: 'number', inputMode: 'numeric' } }}
            />
            <Typography sx={{ fontWeight: 'bold' }}>-</Typography>
            <TextField 
              size="small"
              value={golesV}
              disabled={estaBloqueado}
              onChange={(e) => setGolesV(e.target.value)}
              sx={{ width: 40, '& input': { textAlign: 'center', padding: '4px' } }}
              slotProps={{ htmlInput: { type: 'number', inputMode: 'numeric' } }}
            />
          </Box>
        </Box>

        {/* Visitante */}
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <img src={partido.awayTeam.crest} width="25" alt="" />
          <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
            {partido.awayTeam.name}
          </Typography>
        </Box>

        {/* Botón Dinámico */}
        <Box sx={{ ml: 1 }}>
          {estaBloqueado ? (
            <Button variant="outlined" disabled size="small" startIcon={<LockIcon />} sx={{ minWidth: '100px' }}>
              Cerrado
            </Button>
          ) : (
            <Button
              variant={huboCambios ? "contained" : "outlined"}
              color={huboCambios ? "success" : "primary"}
              size="small"
              onClick={handleAction}
              startIcon={yaTieneDatosEnDB && !huboCambios ? <EditIcon /> : <SaveIcon />}
              sx={{ minWidth: '100px', textTransform: 'none' }}
            >
              {huboCambios ? "Guardar" : "Modificar"}
            </Button>
          )}
        </Box>
      </Box>
      {!esUltimo && <Divider sx={{ opacity: 0.3 }} />}
    </Box>
  );
};

export default Partido;