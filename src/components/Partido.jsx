import { Box, Typography, TextField, Divider } from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Partido = ({ partido, predicciones, onInputChange, esUltimo }) => {
  return (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Local */}
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <img src={partido.homeTeam.crest} width="35" height="25" style={{ objectFit: 'contain' }} alt="" />
          <Typography variant="body2" sx={{ fontWeight: '500', display: 'block' }}>
            {partido.homeTeam.name}
          </Typography>
        </Box>

        {/* Centro */}
        <Box sx={{ flex: 1.5, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            {format(new Date(partido.utcDate), "dd/MM HH:mm", { locale: es })}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
            <TextField 
              size="small" sx={{ width: 45 }}
              slotProps={{ htmlInput: { style: { textAlign: 'center', padding: '5px' }, type: 'number', min: 0 } }}
              value={predicciones[`${partido.id}_L`] || ''}
              onChange={(e) => onInputChange(partido.id, 'L', e.target.value, partido.utcDate)}
            />
            <Typography sx={{ fontWeight: 'bold', alignSelf: 'center' }}>-</Typography>
            <TextField 
              size="small" sx={{ width: 45 }}
              slotProps={{ htmlInput: { style: { textAlign: 'center', padding: '5px' }, type: 'number', min: 0 } }}
              value={predicciones[`${partido.id}_V`] || ''}
              onChange={(e) => onInputChange(partido.id, 'V', e.target.value, partido.utcDate)}
            />
          </Box>
        </Box>

        {/* Visitante */}
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <img src={partido.awayTeam.crest} width="35" height="25" style={{ objectFit: 'contain' }} alt="" />
          <Typography variant="body2" sx={{ fontWeight: '500', display: 'block' }}>
            {partido.awayTeam.name}
          </Typography>
        </Box>
      </Box>
      {!esUltimo && <Divider sx={{ opacity: 0.6 }} />}
    </Box>
  );
};

export default Partido;