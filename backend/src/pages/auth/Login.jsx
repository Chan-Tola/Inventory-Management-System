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
  Paper,
  Container,
  Alert,
  CircularProgress,
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
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        sx={{
          p: { xs: 3, sm: 5 },
          width: "100%",
          background: "#03020A"
        }}
      >
        {/* Logo and Header Section */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          mb={4}
          gap={2}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(13, 71, 161, 0.3)",
            }}
          >
            <img
              src={darkModelogo}
              alt="Company Logo"
              width="70"
              style={{
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
              }}
            />
          </Box>
          <Box textAlign="center">
            <Typography
              component="h1"
              variant="h4"
              fontWeight="bold"
              gutterBottom
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ opacity: 0.8 }}
            >
              Sign in to your Inventory App account
            </Typography>
          </Box>
        </Box>

        {/* Login Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            type="email"
            value={credentials.email}
            onChange={(e) =>
              setCredentials({ ...credentials, email: e.target.value })
            }
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
            placeholder="Enter your email"
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
            placeholder="Enter your password"
            sx={{
              mb: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={toggleShowPassword}
                    edge="end"
                    sx={{
                      color: "text.secondary",
                      "&:hover": {
                        color: "primary.main",
                      },
                    }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Error Display */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mt: 2,
                borderRadius: 2,
                alignItems: "center",
              }}
            >
              {error}
            </Alert>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              borderRadius: 2,
              fontSize: "1rem",
              fontWeight: "bold",
              textTransform: "none",
              background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
              boxShadow: "0 4px 12px rgba(13, 71, 161, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
                boxShadow: "0 6px 16px rgba(13, 71, 161, 0.4)",
                transform: "translateY(-1px)",
              },
              "&:disabled": {
                background: "grey.300",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            {loading ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={20} color="inherit" />
                Signing in...
              </Box>
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Help Text */}
          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
            display="block"
            sx={{ opacity: 0.7 }}
          >
            Use your company credentials to access the inventory system
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
