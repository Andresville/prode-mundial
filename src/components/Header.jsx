import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Container,
  Tab,
  Tabs,
  Button,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";

const Header = ({ user, onLogout, view, setView }) => {
  const handleTabChange = (event, newValue) => {
    if (setView) {
      setView(newValue);
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "rgba(255, 255, 255, 0.05)", 
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{ 
            justifyContent: "space-between", 
            minHeight: { xs: "60px", md: "70px" },
            px: { xs: 1, md: 0 }
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.1rem', md: '1.5rem' },
                background: "linear-gradient(to bottom, #ffffff, #ffd700)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textTransform: "uppercase",
                letterSpacing: -0.5
              }}
            >
              PRODE MUNDIAL
            </Typography>
          </Box>

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1, color: '#fff' }}>
                    {user.displayName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#ffd700', fontWeight: 600 }}>
                    JUGADOR
                  </Typography>
                </Box>
                <Avatar 
                  src={user.photoURL} 
                  sx={{ 
                    width: { xs: 35, md: 42 }, 
                    height: { xs: 35, md: 42 }, 
                    border: '2px solid rgba(255, 215, 0, 0.5)',
                    boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)'
                  }} 
                />
              </Box>

              <Button 
                variant="contained" 
                size="small"
                onClick={onLogout}
                sx={{ 
                  minWidth: { xs: '40px', md: 'auto' },
                  borderRadius: '10px',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  textTransform: 'none',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontWeight: 700,
                  '&:hover': {
                    background: 'rgba(255, 50, 50, 0.2)',
                    borderColor: '#ff4444'
                  }
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', md: 'inline' }, mr: 1 }}>Salir</Box>
                <LogoutIcon sx={{ fontSize: '1.2rem' }} />
              </Button>
            </Box>
          )}
        </Toolbar>

        <Box sx={{ display: "flex", justifyContent: "center", pb: 0.5 }}>
          <Tabs
            value={view}
            onChange={handleTabChange}
            centered
            sx={{
              minHeight: '40px',
              "& .MuiTabs-indicator": {
                backgroundColor: "#ffd700",
                height: 3,
                borderRadius: '3px 3px 0 0',
                boxShadow: "0 0 15px rgba(255,215,0,0.8)",
              },
              "& .MuiTab-root": {
                color: "rgba(255,255,255,0.5)",
                fontWeight: 800,
                fontSize: { xs: "0.75rem", md: "0.9rem" },
                minHeight: "45px",
                textTransform: 'uppercase',
                transition: "0.3s",
                "&.Mui-selected": { color: "#fff" },
                "&:hover": { color: "rgba(255,255,255,0.8)" }
              },
            }}
          >
            <Tab
              value="partidos"
              icon={<SportsSoccerIcon sx={{ fontSize: "1.2rem" }} />}
              iconPosition="start"
              label="Fixture"
            />
            <Tab
              value="ranking"
              icon={<LeaderboardIcon sx={{ fontSize: "1.2rem" }} />}
              iconPosition="start"
              label="Posiciones"
            />
          </Tabs>
        </Box>
      </Container>
    </AppBar>
  );
};

export default Header;
