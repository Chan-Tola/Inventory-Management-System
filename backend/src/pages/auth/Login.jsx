import darkModelogo from "../../assets/images/logo-dark-mode.png";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { loginUser } from "../../redux/slices/authSlice";
import { Visibility, VisibilityOff } from "@mui/icons-material";
// import { useAlert } from "../../hooks/useAlert";
const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  // const { showLoginSuccess, showLoginError } = useAlert();
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate("/");
    // showLoginSuccess();
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      console.log("Login successful:", result);
      navigate("/");
      // showLoginSuccess();
    } catch (error) {
      console.error("Login failed:", error);
      // showLoginError(error.message); // Shows error message
    }
  };
  return (
    <>
      <Grid
        container
        component="main"
        sx={{ height: "100vh" }}
        justifyContent="center"
        alignItems="center"
      >
        <Grid>
          {/* <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>

          </Paper> */}
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mb={3}
            gap={3}
          >
            <img
              src={darkModelogo}
              alt="Company Logo"
              width="80"
              style={{
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
            <Typography component="h1" variant="h5" className="font-bold">
              Inventory App
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              type="email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <center>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  bgcolor: "#0d47a1",
                  color: "white",
                  px: 8,
                  py: 1.5,
                }}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </center>
            {error && (
              <Typography color="error" mt={1}>
                {error}
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default Login;
