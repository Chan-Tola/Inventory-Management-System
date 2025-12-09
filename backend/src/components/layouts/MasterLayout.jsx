import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Box } from "@mui/material";

const MasterLayout = () => {
  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Fixed Sidebar */}
      <Box sx={{ flexShrink: 0 }}>
        <Sidebar />
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Fixed Topbar */}
        <Box sx={{ flexShrink: 0, position: "sticky", top: 0, zIndex: 100 }}>
          <Topbar />
        </Box>

        {/* Scrollable Content Area - Only this part scrolls */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            height: "calc(100vh - 70px)", // 70px is Topbar height
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MasterLayout;
