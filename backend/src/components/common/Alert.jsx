import { createContext } from "react";
import { Snackbar, Alert } from "@mui/material";
const GlobalAlert = ({
  open,
  message,
  severity = "info",
  onClose,
  autoHideDuration = 4000,
}) => {
  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={onClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Alert
          severity={severity}
          onClose={onClose}
          variant="filled"
          sx={{
            width: "100%",
            minWidth: "300px",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default GlobalAlert;
