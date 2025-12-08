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
  CircularProgress,
} from "@mui/material";
import { useSimpleProduct } from "../../../hooks/useSimpleProduct";
import { useSimpleSupplier } from "../../../hooks/useSimpleSupplier";
import { useEffect, useState } from "react";

const TranscationForm = ({
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
  const { productItems: products, loading: productsLoading } =
    useSimpleProduct(false);
  const { supplierItems: suppliers, loading: suppliersLoading } =
    useSimpleSupplier(false);

  const [hasFetchedData, setHasFetchedData] = useState(false);

  // --- Fetch data only when form opens ---
  useEffect(() => {
    const loadData = async () => {
      if (open && !isDeleting && !hasFetchedData) {
        // You might need to dispatch fetch actions manually
        // This depends on how your Redux is set up
        // For now, the hooks will fetch when component mounts
        setHasFetchedData(true);
      }
    };

    loadData();
  }, [open, isDeleting, hasFetchedData]);

  // Reset when form closes
  useEffect(() => {
    if (!open) {
      setHasFetchedData(false);
    }
  }, [open]);
  // --- Safe defaults ---
  const safeFormData = {
    transaction_type: "in",
    product_id: "",
    quantity: "",
    amount: "",
    money_type: "expense",
    supplier_id: "",
    notes: "",
    ...formData,
  };

  //  Then we destructure:
  const {
    transaction_type,
    product_id,
    quantity,
    amount,
    money_type,
    supplier_id,
    notes,
  } = safeFormData;

  // --- Handlers ---
  const handleInputChange = (field) => (e) => {
    onFormDataChange({
      ...safeFormData,
      [field]: e.target.value,
    });
  };

  const handleSubmit = () => {
    console.log("🧾 Staff data before submit:", safeFormData);
    // Prepare data for submission - ensure proper data types
    const submitData = {
      transaction_type: transaction_type,
      product_id: product_id,
      quantity: Number(quantity),
      amount: amount ? Number(amount) : 0,
      money_type: money_type,
      supplier_id: supplier_id,
      notes: notes,
    };

    console.log("📤 Submitting data:", submitData);
    onSubmit(submitData);
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
            {isEditing ? "Edit Transaction" : "Add New Stocks"}
          </DialogTitle>
          <DialogContent>
            <Box>
              {/* product Selection */}
              <FormControl sx={{ my: 2 }} fullWidth required>
                <InputLabel>Product</InputLabel>
                <Select
                  value={product_id}
                  label="Product Name"
                  onChange={handleInputChange("product_id")}
                >
                  <MenuItem value="">
                    <em>Select a category</em>
                  </MenuItem>
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* Transaction Type */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={transaction_type}
                  label="Money Type"
                  onChange={handleInputChange("transaction_type")}
                >
                  <MenuItem value="in">Stock In</MenuItem>
                </Select>
              </FormControl>
              {/* Supplier Selection */}
              <FormControl fullWidth sx={{ mb: 2 }} required>
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={supplier_id}
                  label="Supplier"
                  onChange={handleInputChange("supplier_id")}
                >
                  <MenuItem value="">
                    <em>Select a supplier</em>
                  </MenuItem>
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Quantity */}
              <TextField
                label="Quantity"
                type="number"
                fullWidth
                value={quantity}
                onChange={handleInputChange("quantity")}
                sx={{ mb: 2 }}
                required
              />

              {/* Amount */}
              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={amount}
                onChange={handleInputChange("amount")}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                }}
              />

              {/* Money Type */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Money Type</InputLabel>
                <Select
                  value={money_type}
                  label="Money Type"
                  onChange={handleInputChange("money_type")}
                >
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>

              {/* Notes */}
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={3}
                value={notes}
                onChange={handleInputChange("notes")}
                placeholder="Enter transaction notes..."
                sx={{ mb: 1 }}
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
                : "Add Transaction"}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
};

export default TranscationForm;
