import { useState } from 'react';
import { Box, Typography, TextField, Button, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { guardarResultadoOficial } from '../services/db';

const CargaResultados = ({ partidos }) => {
  const [resultados, setResultados] = useState({});

  const handleChange = (id, lado, valor) => {
    setResultados({ ...resultados, [`${id}_${lado}`]: valor });
  };

  const handleGuardar = async (partidoId) => {
    const gL = resultados[`${partidoId}_L`];
    const gV = resultados[`${partidoId}_V`];
    if (gL !== "" && gV !== "") {
      const ok = await guardarResultadoOficial(partidoId, gL, gV);
      if (ok) alert("Resultado guardado y puntos actualizados!");
    }
  };

  return (
    <Accordion sx={{ mb: 3, bgcolor: '#e8f5e9' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ fontWeight: 'bold', color: '#2e7d32' }}>⚙️ CARGAR RESULTADOS OFICIALES (ADMIN)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {partidos.slice(0, 10).map((p) => ( // Mostramos los primeros para probar
          <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, p: 1, borderBottom: '1px solid #ddd' }}>
            <Typography variant="caption" sx={{ width: 80 }}>{p.homeTeam.name}</Typography>
            <TextField size="small" sx={{ width: 50 }} onChange={(e) => handleChange(p.id, 'L', e.target.value)} />
            <Typography>-</Typography>
            <TextField size="small" sx={{ width: 50 }} onChange={(e) => handleChange(p.id, 'V', e.target.value)} />
            <Typography variant="caption" sx={{ width: 80 }}>{p.awayTeam.name}</Typography>
            <Button size="small" variant="contained" onClick={() => handleGuardar(p.id)}>OK</Button>
          </Box>
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

export default CargaResultados;
