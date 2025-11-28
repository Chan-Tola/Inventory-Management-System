import { Snackbar, Alert, useTheme, alpha } from "@mui/material";
import { CheckCircle, Error, Warning, Info } from "@mui/icons-material";

const Notification = ({
  open,
  message,
  severity,
  onClose,
  autoHideDuration = 5000,
}) => {
  const theme = useTheme();

  // Custom icons for different severity levels
  const iconMapping = {
    success: <CheckCircle sx={{ fontSize: 22 }} />,
    error: <Error sx={{ fontSize: 22 }} />,
    warning: <Warning sx={{ fontSize: 22 }} />,
    info: <Info sx={{ fontSize: 22 }} />,
  };

  // Custom styles based on severity
  const getAlertStyles = (severity) => {
    const baseStyles = {
      borderRadius: 2,
      boxShadow: theme.shadows[8],
      border: `1px solid ${alpha(
        theme.palette[severity]?.main || theme.palette.info.main,
        0.2
      )}`,
      backdropFilter: "blur(10px)",
      alignItems: "center",
      minHeight: "60px",
      "& .MuiAlert-message": {
        padding: "4px 0",
        fontSize: "14px",
        fontWeight: 500,
      },
      "& .MuiAlert-action": {
        alignItems: "flex-start",
        paddingTop: "8px",
      },
    };

    const severityStyles = {
      success: {
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.success.main,
          0.95
        )} 0%, ${alpha(theme.palette.success.dark, 0.9)} 100%)`,
        color: theme.palette.success.contrastText,
      },
      error: {
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.error.main,
          0.95
        )} 0%, ${alpha(theme.palette.error.dark, 0.9)} 100%)`,
        color: theme.palette.error.contrastText,
      },
      warning: {
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.warning.main,
          0.95
        )} 0%, ${alpha(theme.palette.warning.dark, 0.9)} 100%)`,
        color: theme.palette.warning.contrastText,
      },
      info: {
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.info.main,
          0.95
        )} 0%, ${alpha(theme.palette.info.dark, 0.9)} 100%)`,
        color: theme.palette.info.contrastText,
      },
    };

    return { ...baseStyles, ...severityStyles[severity] };
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{
        "& .MuiSnackbar-root": {
          top: "80px !important",
        },
        "& .MuiSnackbar-anchorOriginTopRight": {
          top: "80px",
          right: "24px",
        },
      }}
      ContentProps={{
        sx: {
          padding: 0,
        },
      }}
    >
      <Alert
        severity={severity}
        onClose={onClose}
        icon={iconMapping[severity]}
        sx={getAlertStyles(severity)}
        variant="filled"
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
