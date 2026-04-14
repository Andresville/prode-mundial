import { Typography, Button, List, ListItem, ListItemText, Paper, Avatar, Box } from '@mui/material';
import { gestionarParticipante } from '../services/torneos';

const AdminPanel = ({ torneoId, participantes }) => {
  const pendientes = Object.entries(participantes || {}).filter(
    ([id, data]) => data.estado === 'pendiente'
  );

  if (pendientes.length === 0) return null;

  return (
    <Paper sx={{ p: 2, mb: 3, bgcolor: '#fffde7', border: '1px solid #fbc02d' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#f57f17' }}>
        ⚠️ Solicitudes pendientes para TU grupo
      </Typography>
      <List>
        {pendientes.map(([id, data]) => (
          <ListItem key={id}>
            <Avatar src={data.foto} sx={{ mr: 2 }} />
            <ListItemText primary={data.nombre} secondary={data.email} />
            <Button color="success" onClick={() => gestionarParticipante(torneoId, id, 'autorizado', data)}>
              Autorizar
            </Button>
            <Button color="error" onClick={() => gestionarParticipante(torneoId, id, 'rechazado', data)}>
              X
            </Button>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default AdminPanel;


