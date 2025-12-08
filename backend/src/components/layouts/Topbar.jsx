import { useContext, useState } from "react";
import { Link } from "react-router-dom";

// Material-UI Components
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useTheme,
  Badge,
} from "@mui/material";

// Material-UI Icons
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";

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
  const colorMode = useContext(ColorModeContext);
  const { handleLogout, user } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);

  // note: CONSTANTS
  const MENU_ITEMS = [
    {
      name: "Profile",
      path: "setting",
      icon: <PersonOutlineIcon sx={{ fontSize: 20 }} />,
    },
    { name: "Logout", icon: <LogoutIcon sx={{ fontSize: 20 }} /> },
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
      padding: "12px 20px",
      fontSize: "15px",
      fontWeight: 500,
      textTransform: "none",
      minHeight: "46px",
      borderRadius: "8px",
      width: "100%",
      gap: 3,
    };

    if (setting.name === "Logout") {
      return (
        <Button
          fullWidth
          onClick={handleLogoutClick}
          startIcon={setting.icon}
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
        startIcon={setting.icon}
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
      alignItems="center"
      p={2.5}
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        backdropFilter: "blur(10px)",
        height: "70px",
      }}
    >
      {/* Date Section */}
      <Box>
        <Typography
          variant="h5"
          component="h2"
          fontWeight="bold"
          color="text.primary"
          sx={{
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(45deg, #90caf9, #e3f2fd)"
                : "linear-gradient(45deg, #1976d2, #42a5f5)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            fontWeight: 700,
            fontSize: "1.6rem",
          }}
        >
          Today, {date}
        </Typography>
      </Box>

      {/* note: ACTIONS SECTION */}
      <Box display="flex" alignItems="center" gap={2}>
        {/* note: Theme Toggle Button */}
        <Tooltip
          title={`Switch to ${
            theme.palette.mode === "dark" ? "light" : "dark"
          } mode`}
        >
          <IconButton
            onClick={colorMode.toggleColorMode}
            sx={{
              backgroundColor: theme.palette.action.hover,
              width: 44,
              height: 44,
              "&:hover": {
                backgroundColor: theme.palette.action.selected,
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            {theme.palette.mode === "dark" ? (
              <LightModeOutlinedIcon fontSize="medium" />
            ) : (
              <DarkModeOutlinedIcon fontSize="medium" />
            )}
          </IconButton>
        </Tooltip>

        {/* Notifications Button - Optional */}
        {/* <Tooltip title="Notifications">
          <IconButton
            sx={{
              backgroundColor: theme.palette.action.hover,
              width: 44,
              height: 44,
              '&:hover': {
                backgroundColor: theme.palette.action.selected,
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <Badge badgeContent={0} color="error" variant="dot">
              <NotificationsOutlinedIcon fontSize="medium" />
            </Badge>
          </IconButton>
        </Tooltip> */}

        {/* Profile Section */}
        <Box>
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{
                padding: 0.5,
                border: `2px solid ${theme.palette.primary.main}30`,
                width: 46,
                height: 46,
                "&:hover": {
                  border: `2px solid ${theme.palette.primary.main}`,
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <Avatar
                alt={user.name}
                src={user.staff?.profile_url}
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: theme.palette.primary.main,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
              >
                {!user.staff?.profile_url && user.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* Profile Dropdown Menu */}
          <Menu
            sx={{
              mt: "52px",
              "& .MuiPaper-root": {
                borderRadius: 2,
                boxShadow: theme.shadows[10],
                minWidth: 180,
                border: `1px solid ${theme.palette.divider}`,
              },
            }}
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
            {/* Menu Items */}
            {MENU_ITEMS.map((setting) => (
              <MenuItem
                key={setting.name}
                sx={{
                  padding: 0.5,
                  margin: "5px 10px",
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                }}
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
