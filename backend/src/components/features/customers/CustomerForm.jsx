// note: Imports
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useEffect, useState } from "react";

const CustomerForm = ({
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
  // Ensure default values match the available options
  const safeFormData = {
    name: "",
    email: "",
    password: "",
    gender: "male",
    address: "",
    ...formData,
  };
  const { name, email, password, gender, address } = safeFormData;
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    console.log("CustomerForm Debug:", {
      isEditing,
      open,
      hasFormData: !!formData,
      formDataKeys: Object.keys(formData),
    });
  }, [isEditing, open, formData]);

  //handle input change
  const handleInputChange = (field) => (e) => {
    onFormDataChange({
      ...safeFormData,
      [field]: e.target.value,
    });
  };

  // Handle roles change - convert to array
  const handleRolesChange = (e) => {
    const selectedRole = e.target.value;
    // Convert to array format that backend expects
    const rolesArray = selectedRole ? [selectedRole] : [];

    onFormDataChange({
      ...safeFormData,
      roles: rolesArray,
    });
  };

  // handle submit
  const handleSubmit = () => {
    console.log("🧾 Staff data before submit:", safeFormData);
    // Prepare data for submission - ensure proper data types
    const submitData = {
      name: name,
      email: email,
      password: password,
      gender: gender, // Keep as is since your working JSON uses "male"
      address: address,
      // roles: roles, // Remove roles field since it's not in your working JSON
    };
    console.log("📤 Submitting data:", submitData);
    onSubmit(submitData);
  };

  if (isDeleting) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this customer member?
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
            {isEditing ? "Edit Information Customer" : "Add New Customer"}
          </DialogTitle>
          <DialogContent>
            <Box>
              {/* customer email */}
              {!isEditing && (
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={handleInputChange("email")}
                  required
                  sx={{ my: 2 }}
                />
              )}

              {/* customer password */}
              {!isEditing && (
                <TextField
                  label="Password"
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handleInputChange("password")}
                  sx={{ my: 2 }}
                  required
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
              )}
              {/* staff name */}
              <TextField
                label="Name"
                fullWidth
                value={name}
                onChange={handleInputChange("name")}
                sx={{ my: 2 }}
                required
              />
              {/* Gender Selection */}
              <FormControl sx={{ my: 2 }} fullWidth required>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={gender}
                  label="Gender"
                  onChange={handleInputChange("gender")}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>

              {/* Address */}
              <TextField
                label="Address"
                fullWidth
                multiline
                rows={3}
                value={address}
                onChange={handleInputChange("address")}
                placeholder="Enter staff address"
                sx={{ my: 2 }}
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
                ? "Update Customer"
                : "Create Customer"}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
};

export default CustomerForm;
