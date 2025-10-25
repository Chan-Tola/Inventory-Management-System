import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  DialogContentText,
} from "@mui/material";

const CategoryForm = ({
  open,
  onClose,
  isEditing,
  isDeleting,
  formData,
  loading,
  onSubmit,
  onDelete, // Add delete handler
  onFormDataChange,
}) => {
  // Create a safe version of formData with default values
  const safeFormData = formData || { name: "", description: "" };

  // Safe access to properties with fallbacks
  const name = safeFormData.name || "";
  const description = safeFormData.description || "";

  // Safe trim check
  const isNameValid = name ? name.trim() !== "" : false;

  const handleSubmit = () => {
    onSubmit(formData);
  };
  const handleNameChange = (e) => {
    onFormDataChange({
      ...safeFormData,
      name: e.target.value,
    });
  };

  const handleDescriptionChange = (e) => {
    onFormDataChange({
      ...safeFormData,
      description: e.target.value,
    });
  };

  if (isDeleting) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
              onChange={handleNameChange}
              sx={{ mb: 2 }}
              required
              error={!isNameValid}
              helperText={!isNameValid ? "Category name is required" : ""}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Enter category description (optional)"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading || !isNameValid}
            >
              {loading
                ? "Saving..."
                : isEditing
                ? "Update Category"
                : "Create Category"}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
};

export default CategoryForm;
