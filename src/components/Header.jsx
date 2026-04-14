import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Container,
  Tab,
  Tabs,
  IconButton,
  Button,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import copaImg from "../assets/imagen copa.svg";

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
        background: "rgba(88, 88, 180, 0.95)",
        backdropFilter: "blur(15px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{ justifyContent: "space-between", minHeight: "50px" }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              component="img"
              src={copaImg}
              sx={{
                height: 38,
                filter: "drop-shadow(0 0 5px rgba(255,215,0,0.4))",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                background: "linear-gradient(to bottom, #ffffff, #ffd700)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textTransform: "uppercase",
              }}
            >
              PRODE MUNDIAL
            </Typography>
          </Box>

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar 
                  src={user.photoURL} 
                  sx={{ 
                    width: 38, 
                    height: 38, 
                    border: '2px solid rgba(255, 215, 0, 0.6)',
                    boxShadow: '0 0 10px rgba(255, 215, 0, 0.2)'
                  }} 
                />
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1, color: '#fff' }}>
                    {user.displayName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Jugador Oficial
                  </Typography>
                </Box>
              </Box>

              <Button 
                variant="outlined" 
                color="inherit" 
                onClick={onLogout}
                startIcon={<LogoutIcon />}
                sx={{ 
                  borderRadius: '12px',
                  textTransform: 'none',
                  borderColor: 'rgba(255,255,255,0.3)',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#fff',
                    background: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Salir
              </Button>
            </Box>
          )}
        </Toolbar>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Tabs
            value={view}
            onChange={handleTabChange}
            textColor="inherit"
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "#ffd700",
                height: 3,
                boxShadow: "0 0 10px rgba(255,215,0,0.5)",
              },
              "& .MuiTab-root": {
                color: "rgba(255,255,255,0.4)",
                fontWeight: 700,
                fontSize: "0.85rem",
                minHeight: "48px",
                transition: "0.3s",
                "&.Mui-selected": { color: "#fff" },
              },
            }}
          >
            <Tab
              value="partidos"
              icon={<SportsSoccerIcon sx={{ fontSize: "1.2rem" }} />}
              iconPosition="start"
              label="Partidos"
            />
            <Tab
              value="ranking"
              icon={<LeaderboardIcon sx={{ fontSize: "1.2rem" }} />}
              iconPosition="start"
              label="Ranking"
            />
          </Tabs>
        </Box>
      </Container>
    </AppBar>
  );
};

export default Header;

