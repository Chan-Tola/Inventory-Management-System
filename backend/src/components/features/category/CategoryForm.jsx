import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  DialogContentText,
  CircularProgress,
  Box,
} from "@mui/material";

const CategoryForm = ({
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
  const safeFormData = { name: "", description: "", ...formData };
  const { name, description } = safeFormData;

  // --- Validation ---
  const isNameValid = !!name.trim();
  const isFormValid = isNameValid; // description is optional

  // --- Handlers ---
  const handleChange = (field) => (e) =>
    onFormDataChange({ ...safeFormData, [field]: e.target.value });

  const handleSubmit = () => onSubmit(safeFormData);

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
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onDelete} disabled={loading} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
  } else {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        {/* Loading Overlay for Form */}
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
          {isEditing ? "Edit Category" : "Add new Category"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={name}
            onChange={handleChange("name")}
            sx={{ my: 2 }}
            required
            error={!isNameValid}
            helperText={!isNameValid && "Category name is required"}
            disabled={loading}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={description}
            onChange={handleChange("description")}
            placeholder="Enter category description (optional)"
            disabled={loading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !isFormValid}
          >
            {isEditing ? "Update Category" : "Create Category"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
};

export default CategoryForm;
