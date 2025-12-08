import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  DialogContentText,
  Box,
  CircularProgress,
} from "@mui/material";

const SupplierForm = ({
  open,
  onClose,
  isEditing,
  isDeleting,
  formData,
  loading,
  onSubmit,
  onDelete,
  onFormDataChange,
}) => {
  // --- Safe defaults ---
  const safeFormData = {
    name: "",
    contact: "",
    address: "",
    ...formData,
  };
  const { name, contact, address } = safeFormData;

  // --- Handlers ---
  const handleInputChange = (field) => (e) => {
    onFormDataChange({
      ...safeFormData,
      [field]: e.target.value,
    });
  };

  const handleSubmit = () => {
    console.log("🧾 Product data before submit:", safeFormData);
    onSubmit(safeFormData);
  };

  if (isDeleting) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        {/* Loading Overlay for Delete */}
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onDelete} disabled={loading} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
  } else {
    return (
      <>
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
          {/* Loading Overlay for Delete */}
          {loading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <DialogTitle>
            {isEditing ? "Edit Supplier" : "Add new Supplier"}
          </DialogTitle>
          <DialogContent>
            <Box>
              {/* supplier name */}
              <TextField
                label="Supplier Name"
                fullWidth
                value={name}
                onChange={handleInputChange("name")}
                sx={{ my: 2 }}
                required
              />
              {/* contact name */}
              <TextField
                label="Supplier Contacts"
                fullWidth
                value={contact}
                onChange={handleInputChange("contact")}
                sx={{ my: 2 }}
                required
              />
              {/* address name */}
              <TextField
                label="Supplier Supplier"
                fullWidth
                multiline
                rows={3}
                value={address}
                placeholder="Enter supplier address"
                onChange={handleInputChange("address")}
                sx={{ mb: 2 }}
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isEditing
                ? "Update Supplier"
                : "Create Supplier"}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
};

export default SupplierForm;
