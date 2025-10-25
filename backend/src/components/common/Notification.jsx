import { Snackbar, Alert } from "@mui/material";
const Notification = ({
  open,
  message,
  severity,
  onClose,
  autoHideDuration = 5000,
}) => {
  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={onClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={severity} onClose={onClose}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Notification;
