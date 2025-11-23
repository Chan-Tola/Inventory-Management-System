import { Box, Typography, Paper, useTheme } from "@mui/material";
import { tokens } from "../../../theme";
const Card = ({ title, value, icon }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const isDarkMode = theme.palette.mode === "dark";
  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 3,
        minWidth: 240,
        borderRadius: 3,
        backgroundColor: colors.primary[400],
        color: colors.grey[100],
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        // border: "",`${colors.primary[400]} !important`
        border: isDarkMode
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "1px solid rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(10px)",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease-in-out",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      {/* Header section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            opacity: 0.9,
            fontSize: "0.875rem",
            fontWeight: 500,
            letterSpacing: "0.5px",
          }}
        >
          {title}
        </Typography>

        <Box
          sx={{
            fontSize: "1.75rem",
            opacity: 0.8,
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "scale(1.1)",
              opacity: 1,
            },
          }}
        >
          {icon}
        </Box>
      </Box>

      {/* Value section */}
      <Box sx={{ mb: 1 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: { xs: "1.75rem", md: "2rem" },
            letterSpacing: "-0.5px",
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  );
};

export default Card;
