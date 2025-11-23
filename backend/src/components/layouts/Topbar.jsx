import { useContext, useState } from "react";
import { Link } from "react-router-dom";

// Material-UI Components
import {
  Avatar,
  Box,
  Button,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

// Material-UI Icons
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
// import SearchIcon from "@mui/icons-material/Search";

// Custom Hooks & Context
import { ColorModeContext, tokens } from "../../theme";
import { useAuth } from "../../hooks/useAuth";

const Topbar = () => {
  // note: STATE & CONTEXT
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const date = new Date()
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
    .replace(",", "");
  // const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const { handleLogout, user } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);

  // note: CONSTANTS
  const MENU_ITEMS = [
    { name: "Profile", path: "setting" },
    { name: "Logout" }, // Logout has no path, handled by onClick
  ];

  // note: EVENT HANDLERS
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleLogout();
    handleProfileMenuClose();
  };

  // note: RENDER FUNCTIONS
  const renderMenuButton = (setting) => {
    const commonStyles = {
      justifyContent: "flex-start",
      padding: "10px 20px",
      fontSize: "15px",
      fontWeight: 500,
      textTransform: "none",
      minHeight: "44px",
      borderRadius: 0,
      width: "100%",
    };

    if (setting.name === "Logout") {
      return (
        <Button
          fullWidth
          onClick={handleLogoutClick}
          sx={{
            ...commonStyles,
            color: "error.main",
            "&:hover": {
              backgroundColor: "error.light",
              color: "white",
            },
          }}
        >
          {setting.name}
        </Button>
      );
    }

    return (
      <Button
        component={Link}
        to={setting.path}
        fullWidth
        onClick={handleProfileMenuClose}
        sx={{
          ...commonStyles,
          color: "text.primary",
          "&:hover": {
            backgroundColor: "primary.light",
            color: "white",
          },
        }}
      >
        {setting.name}
      </Button>
    );
  };
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      p={2}
      sx={{ borderBottom: `2px solid ${colors.primary[100]}` }}
    >
      {/* note: SEARCH SECTION  */}
      <Typography variant="h5" component="h2" fontWeight="bold">
        Today,{date}
      </Typography>
      <Box></Box>

      {/* note: ACTIONS SECTION  */}
      <Box display="flex" alignItems="center" gap={1}>
        {/* note: Theme Toggle Button */}
        <IconButton onClick={colorMode.toggleColorMode}>
          {colors === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>

        {/* Notifications Button */}
        <IconButton>
          <NotificationsOutlinedIcon />
        </IconButton>

        {/* Profile Section */}
        <Box>
          <Tooltip title="Open settings">
            <IconButton onClick={handleProfileMenuOpen}>
              <Avatar alt={user.name} src={user.staff?.profile_url} />
            </IconButton>
          </Tooltip>

          {/* Profile Dropdown Menu */}
          <Menu
            sx={{ mt: "55px" }}
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            {MENU_ITEMS.map((setting) => (
              <MenuItem
                key={setting.name}
                sx={{ padding: 0 }}
                onClick={
                  setting.name === "Logout"
                    ? handleLogoutClick
                    : handleProfileMenuClose
                }
              >
                {renderMenuButton(setting)}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>
    </Box>
  );
};

export default Topbar;
