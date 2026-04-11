import { Card, CardContent, Typography, Grid, Avatar, Box } from '@mui/material';

const Ranking = ({ usuarios }) => (
  <Box sx={{ mt: 5 }}>
    <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>📊 Posiciones</Typography>
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        {usuarios.map((u, i) => (
          <Grid container key={u.id} sx={{ py: 1, alignItems: 'center', borderBottom: '1px solid #eee' }}>
            <Grid item xs={2}>{i + 1}°</Grid>
            <Grid item xs={7} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar src={u.photo} sx={{ width: 24, height: 24 }} />
              {u.nombre}
            </Grid>
            <Grid item xs={3} sx={{ textAlign: 'center', fontWeight: 'bold' }}>{u.puntos}</Grid>
          </Grid>
        ))}
      </CardContent>
    </Card>
  </Box>
);

export default Ranking;