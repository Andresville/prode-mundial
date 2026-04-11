// src/components/AdminPanel.jsx (Actualizado)
import { Box, Typography, Button, List, ListItem, ListItemText, Paper, Avatar, Divider } from '@mui/material';
import { gestionarParticipante } from '../services/torneos';
import CargaResultados from './CargaResultados'; // <--- Importamos

const AdminPanel = ({ torneoId, participantes, partidos }) => { // <--- Recibimos partidos
  const pendientes = Object.entries(participantes || {}).filter(
    ([id, data]) => data.estado === 'pendiente'
  );

  return (
    <Box>
      {/* Sección de Resultados Oficiales */}
      <CargaResultados partidos={partidos} />

      {/* Sección de Solicitudes (Solo si hay pendientes) */}
      {pendientes.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#fffde7', border: '1px solid #fbc02d' }}>
           <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#f57f17' }}>
            ⚠️ Solicitudes de ingreso ({pendientes.length})
          </Typography>
          <List>
            {pendientes.map(([id, data]) => (
              <ListItem key={id}>
                <Avatar src={data.foto} sx={{ mr: 2 }} />
                <ListItemText primary={data.nombre} secondary={data.email} />
                <Button color="success" onClick={() => gestionarParticipante(torneoId, id, 'autorizado', data)}>Aceptar</Button>
                <Button color="error" onClick={() => gestionarParticipante(torneoId, id, 'rechazado', data)}>X</Button>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default AdminPanel;

