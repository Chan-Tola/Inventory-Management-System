import { Box, IconButton, InputBase, useTheme } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";
const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const coloeMode = useContext(ColorModeContext);

  return (
    <>
      <Box display={"flex"} justifyContent="space-between" p={2}>
        {/* Search bar */}
        <Box
          display={"flex"}
          backgroundColor={colors.primary[400]}
          borderRadius={"3px"}
        >
          <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
          <IconButton type="button" sx={{ p: 1 }}>
            <SearchIcon />
          </IconButton>
        </Box>
        <Box display={"flex"}>
          {/* Icons */}
          <IconButton onClick={coloeMode.toggleColorMode}>
            {theme.palette.mode === "dark" ? (
              <DarkModeOutlinedIcon />
            ) : (
              <LightModeOutlinedIcon />
            )}
          </IconButton>
          <IconButton>
            <NotificationsOutlinedIcon />
          </IconButton>
          <IconButton>
            <SettingsOutlinedIcon />
          </IconButton>
          <IconButton>
            <PersonOutlineOutlinedIcon />
          </IconButton>
        </Box>
      </Box>
    </>
  );
};

export default Topbar;
