// pages/UnauthorizedPage.js
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      textAlign="center"
    >
      <Typography variant="h3" gutterBottom>
        ⚠️ Unauthorized Access
      </Typography>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        You don't have permission to access this page.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/")} sx={{ mt: 2 }}>
        Go to Dashboard
      </Button>
    </Box>
  );
};

export default UnauthorizedPage;
