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

const StaffForm = ({
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
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Ensure default values match the available options
  const safeFormData = {
    name: "",
    email: "",
    password: "",
    gender: "male",
    phone: "",
    address: "",
    salary: "",
    hire_date: "",
    profile_url: "",
    roles: [], // Change to empty array since backend expects array
    ...formData,
  };

  const {
    name,
    email,
    password,
    gender,
    phone,
    address,
    salary,
    hire_date,
    profile_url,
    roles,
  } = safeFormData;

  useEffect(() => {
    console.log("StaffForm Debug:", {
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
      phone: phone,
      address: address,
      salary: salary ? Number(salary) : 0,
      hire_date: hire_date,
      profile_url: profile_url,
      // roles: roles, // Remove roles field since it's not in your working JSON
    };

    console.log("📤 Submitting data:", submitData);
    onSubmit(submitData);
  };

  // handle insert image
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Take only the first file
      const file = files[0];

      // convert image to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        onFormDataChange({
          ...safeFormData,
          profile_url: e.target.result,
          // profile_url: [e.target.result],
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    // Clear the profile_url
    onFormDataChange({
      ...safeFormData,
      profile_url: "",
      // profile_url: [],
    });
  };

  if (isDeleting) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this staff member?
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
            {isEditing ? "Edit Information" : "Create New Staff"}
          </DialogTitle>
          <DialogContent>
            <Box>
              {/* Image Upload */}
              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Profile Image
                </Typography>

                {/* Only show upload button if no image is selected */}
                {!profile_url && (
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{ width: 250 }}
                  >
                    Upload Profile Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                )}

                {/* Preview uploaded image */}
                {profile_url && (
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        position: "relative",
                        justifyContent: "center", // Center horizontally
                        alignItems: "center", // Center vertically
                        mt: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: 100,
                          overflow: "hidden",
                          border: "1px solid #ccc",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <img
                          src={profile_url}
                          alt="Profile"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                      <Button
                        size="small"
                        onClick={removeImage}
                        sx={{
                          position: "absolute",
                          top: -10,
                          right: -8,
                          minWidth: 0,
                          width: 24,
                          height: 24,
                          backgroundColor: "rgba(0,0,0,0.4)",
                          color: "white",
                          "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                          fontSize: "12px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        ×
                      </Button>
                    </Box>

                    {/* Option to change image - also centered */}
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 1 }}
                    >
                      <Button
                        variant="outlined"
                        component="label"
                        size="small"
                        sx={{ width: 250 }} // Fixed width 250px
                      >
                        Change Image
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
              {/* staff email */}
              {!isEditing && (
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={handleInputChange("email")}
                  required
                  sx={{ mb: 2 }}
                />
              )}

              {/* staff password */}
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

              {!isEditing && (
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  {/* Gender Selection */}
                  <FormControl sx={{ flex: 1 }} required>
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

                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={
                        Array.isArray(roles) && roles.length > 0 ? roles[0] : ""
                      }
                      label="Role"
                      onChange={handleRolesChange}
                    >
                      <MenuItem value="staff">Staff</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}
              {/* Phone number and Salary in one row */}
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                {/* Phone number */}
                <TextField
                  label="Phone Number"
                  fullWidth
                  value={phone}
                  onChange={handleInputChange("phone")}
                  required
                />

                {/* Salary */}
                <TextField
                  label="Salary"
                  fullWidth
                  type="number"
                  value={salary}
                  onChange={handleInputChange("salary")}
                  required
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                />
              </Box>

              {/* Hire Date */}
              {!isEditing && (
                <TextField
                  label="Hire Date"
                  type="date"
                  fullWidth
                  value={hire_date}
                  onChange={handleInputChange("hire_date")}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{ mb: 2 }}
                  required
                />
              )}

              {/* Address */}
              <TextField
                label="Address"
                fullWidth
                multiline
                rows={3}
                value={address}
                onChange={handleInputChange("address")}
                placeholder="Enter staff address"
                sx={{ mb: 2 }}
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
                ? "Update Staff"
                : "Create Staff"}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
};

export default StaffForm;
