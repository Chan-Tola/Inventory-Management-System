// note: Imports
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
  CircularProgress,
} from "@mui/material";

// note: Component props
const ProductForm = ({
  open,
  onClose,
  isEditing,
  isDeleting,
  formData,
  loading,
  onSubmit,
  onDelete, // Add delete handler
  onFormDataChange,
  categories = [],
}) => {
  /*
  Safe defaults This merges default empty values with the real formData, 
   so if any field is missing (like on first render), the component won’t crash.
  */
  const safeFormData = {
    name: "",
    sku: "",
    category_id: "",
    brand: "",
    price: "",
    sale_price: "",
    description: "",
    images: [],
    ...formData,
  };

  //  Then we destructure:
  const {
    name,
    sku,
    category_id,
    brand,
    price,
    sale_price,
    description,
    images,
  } = safeFormData;

  //handle input change
  const handleInputChange = (field) => (e) => {
    onFormDataChange({
      ...safeFormData,
      [field]: e.target.value,
    });
  };

  // handle submit
  const handleSubmit = () => {
    console.log("🧾 Product data before submit:", safeFormData);
    onSubmit(safeFormData);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Convert images to base64
      const imagePromises = files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              data: e.target.result, // base64 string with data URL
            });
          };
          reader.readAsDataURL(file);
        });
      });
      Promise.all(imagePromises).then((newImages) => {
        onFormDataChange({
          ...safeFormData,
          images: [...images, ...newImages],
        });
      });
    }
  };
  const removeImage = (index, imageId = null) => {
    console.log(imageId);
    // If it's an existing image (has ID), add to deleted array
    if (imageId) {
      setDeletedImageIds((prev) => [...prev, imageId]);
    }

    // Remove from local images array
    const updatedImages = images.filter((_, i) => i !== index);
    onFormDataChange({
      ...safeFormData,
      images: updatedImages,
    });
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
            Are you sure you want to delete this product?
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
            {isEditing ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogContent>
            <Box>
              {/* product name */}
              <TextField
                label="Product Name"
                fullWidth
                value={name}
                onChange={handleInputChange("name")}
                sx={{ my: 2 }}
                required
              />
              {/* product SKU */}
              <TextField
                label="SKU"
                fullWidth
                value={sku}
                onChange={handleInputChange("sku")}
                required
                sx={{ my: 2 }}
              />
              {/* Category Selection */}
              <FormControl sx={{ my: 2 }} fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category_id}
                  label="Category"
                  onChange={handleInputChange("category_id")}
                >
                  <MenuItem value="">
                    <em>Select a category</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.id} {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Brand */}
              <TextField
                label="Brand"
                fullWidth
                value={brand}
                onChange={handleInputChange("brand")}
                sx={{ my: 2 }}
              />

              {/* Price */}
              <TextField
                label="Unit Price"
                type="number"
                fullWidth
                value={price}
                onChange={handleInputChange("price")}
                required
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
                sx={{ my: 2 }}
              />
              {/* Price */}
              <TextField
                label="Sale Price"
                type="number"
                fullWidth
                value={sale_price}
                onChange={handleInputChange("sale_price")}
                required
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
                sx={{ my: 2 }}
              />

              {/* Description */}
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={description}
                onChange={handleInputChange("description")}
                placeholder="Enter product description"
                sx={{ my: 2 }}
              />
              {/* Image Upload */}
              <Box sx={{ my: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Product Images
                </Typography>
                <Button variant="outlined" component="label" fullWidth>
                  Upload Images
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
                {/* Preview uploaded images */}
                {/* Display uploaded images */}
                {images.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Uploaded images ({images.length}):
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                        mt: 1,
                      }}
                    >
                      {images.map((image, index) => (
                        <Box
                          key={index}
                          sx={{
                            position: "relative",
                            width: 100,
                            height: 100,
                            borderRadius: 2,
                            overflow: "hidden",
                            border: "1px solid #ccc",
                          }}
                        >
                          <img
                            src={
                              image instanceof File
                                ? URL.createObjectURL(image)
                                : typeof image === "string"
                                ? image
                                : image?.url || image?.data || ""
                            }
                            alt={`Product ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              cursor: "pointer",
                            }}
                            onClick={(e) => e.preventDefault()}
                          />

                          <Button
                            size="small"
                            onClick={() => removeImage(index, image.id)}
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              minWidth: 0,
                              backgroundColor: "rgba(0,0,0,0.4)",
                              color: "white",
                              "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                            }}
                          >
                            X
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
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
                ? "Update Product"
                : "Create Product"}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
};

export default ProductForm;
