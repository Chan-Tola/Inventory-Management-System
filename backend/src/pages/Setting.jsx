import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  TextField,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { tokens } from "../theme";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const Setting = () => {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [form, setForm] = useState({
    name: "",
    email: "",
    gender: "",
    phone: "",
    address: "",
    salary: "",
  });

  // Initialize form with user data when user is available
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        gender: user.staff?.gender || "",
        phone: user.staff?.phone || "",
        address: user.staff?.address || "",
        salary: user.staff?.salary || "",
      });
    }
  }, [user]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3} display="flex" justifyContent="center">
      <Box
        sx={{
          maxWidth: 1300,
          borderRadius: "16px",
          width: "100%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          border: `3px dashed ${colors.primary[300]}`,
        }}
        p={5}
      >
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold">
            Personal Infomation
          </Typography>
        </Box>

        <Card
          sx={{
            background: `${colors.primary[400]}`,
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            border: `1px solid ${colors.primary[300]}`,
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box
              display="flex"
              flexDirection={{ xs: "column", md: "row" }}
              alignItems="center"
              justifyContent="center"
              gap={6}
            >
              {/* Avatar Section - Centered */}
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                sx={{ minWidth: { md: 250 } }}
              >
                <Avatar
                  src={
                    user?.staff?.profile_url ||
                    "https://cdn-icons-png.flaticon.com/512/147/147142.png"
                  }
                  sx={{
                    width: 180,
                    height: 180,
                    mb: 3,
                    border: `2px solid ${colors.primary[100]}`,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  }}
                >
                  {user?.name?.charAt(0)}
                </Avatar>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  textAlign="center"
                  sx={{ color: colors.primary[100] }}
                >
                  {form.name}
                </Typography>
                <Typography
                  variant="h6"
                  textAlign="center"
                  sx={{ color: colors.greenAccent[400], mt: 1 }}
                >
                  {user?.roles?.[0] || "Staff"}
                </Typography>
              </Box>

              {/* Info Fields Section - Centered */}
              <Box
                flexGrow={1}
                sx={{
                  maxWidth: { md: 600 },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box
                  display="grid"
                  gridTemplateColumns={{ md: "1fr 1fr" }}
                  gap={3}
                  sx={{ width: "100%" }}
                >
                  {/* Name Field */}
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      sx={{
                        color: colors.primary[100],
                        textTransform: "uppercase",
                      }}
                    >
                      Full Name
                    </Typography>
                    <TextField
                      fullWidth
                      value={form.name}
                      disabled
                      sx={{
                        mt: 0.5,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: colors.primary[400],
                          "& fieldset": {
                            borderColor: colors.primary[400],
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: colors.primary[100],
                          fontWeight: "500",
                          textAlign: "center",
                        },
                      }}
                      size="medium"
                    />
                  </Box>

                  {/* Email Field */}
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      sx={{
                        color: colors.primary[100],
                        textTransform: "uppercase",
                      }}
                    >
                      Email
                    </Typography>
                    <TextField
                      fullWidth
                      value={form.email}
                      disabled
                      sx={{
                        mt: 0.5,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: colors.primary[400],
                          "& fieldset": {
                            borderColor: colors.primary[400],
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: colors.primary[100],
                          textAlign: "center",
                        },
                      }}
                      size="medium"
                    />
                  </Box>

                  {/* Gender Field */}
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      sx={{
                        color: colors.primary[100],
                        textTransform: "uppercase",
                      }}
                    >
                      Gender
                    </Typography>
                    <TextField
                      fullWidth
                      value={form.gender}
                      disabled
                      sx={{
                        mt: 0.5,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: colors.primary[400],
                          "& fieldset": {
                            borderColor: colors.primary[400],
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: colors.primary[100],
                          textTransform: "capitalize",
                          textAlign: "center",
                        },
                      }}
                      size="medium"
                    />
                  </Box>

                  {/* Phone Field */}
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      sx={{
                        color: colors.primary[100],
                        textTransform: "uppercase",
                      }}
                    >
                      Phone Number
                    </Typography>
                    <TextField
                      fullWidth
                      value={form.phone}
                      disabled
                      sx={{
                        mt: 0.5,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: colors.primary[400],
                          "& fieldset": {
                            borderColor: colors.primary[400],
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: colors.primary[100],
                          textAlign: "center",
                        },
                      }}
                      size="medium"
                    />
                  </Box>

                  {/* Salary Field */}
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      sx={{
                        color: colors.primary[100],
                        textTransform: "uppercase",
                      }}
                    >
                      Salary
                    </Typography>
                    <TextField
                      fullWidth
                      value={form.salary}
                      disabled
                      sx={{
                        mt: 0.5,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: colors.primary[400],
                          "& fieldset": {
                            borderColor: colors.primary[400],
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: colors.primary[100],
                          fontWeight: "500",
                          textAlign: "center",
                        },
                      }}
                      size="medium"
                    />
                  </Box>

                  {/* Staff Code Field (if available) */}
                  {user?.staff?.staff_code && (
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                    >
                      <Typography
                        variant="caption"
                        fontWeight="bold"
                        sx={{
                          color: colors.primary[100],
                          textTransform: "uppercase",
                        }}
                      >
                        Staff Code
                      </Typography>
                      <TextField
                        fullWidth
                        value={user.staff.staff_code}
                        disabled
                        sx={{
                          mt: 0.5,
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: colors.primary[400],
                            "& fieldset": {
                              borderColor: colors.primary[400],
                            },
                          },
                          "& .MuiInputBase-input": {
                            color: colors.primary[100],
                            fontWeight: "500",
                            textAlign: "center",
                          },
                        }}
                        size="medium"
                      />
                    </Box>
                  )}

                  {/* Address Field */}
                  <Box
                    gridColumn={{ md: "1 / -1" }}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      sx={{
                        color: colors.primary[100],
                        textTransform: "uppercase",
                      }}
                    >
                      Address
                    </Typography>
                    <TextField
                      fullWidth
                      value={form.address}
                      disabled
                      multiline
                      rows={2}
                      sx={{
                        mt: 0.5,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: colors.primary[400],
                          "& fieldset": {
                            borderColor: colors.primary[400],
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: colors.primary[100],
                          textAlign: "center",
                        },
                      }}
                      size="medium"
                    />
                  </Box>
                </Box>

                {/* Status Indicator - Centered */}
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mt={4}
                  p={2}
                  sx={{
                    backgroundColor: colors.primary[400],
                    borderRadius: "8px",
                    borderLeft: `4px solid ${colors.greenAccent[500]}`,
                    width: "100%",
                    maxWidth: 400,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: colors.greenAccent[500],
                      mr: 2,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: colors.primary[100] }}
                  >
                    Account Status:{" "}
                    <span
                      style={{
                        color: colors.greenAccent[400],
                        fontWeight: "bold",
                      }}
                    >
                      Active
                    </span>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Setting;
