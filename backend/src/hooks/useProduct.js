import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  clearError,
  clearSuccess,
  setCurrentProduct,
  clearCurrentProduct,
} from "../redux/slices/productSlice";

export const useProduct = () => {
  const dispatch = useDispatch();
  const { productItems, loading, error, success, currentProduct } = useSelector(
    (state) => state.products
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    category_id: "",
    description: "",
    images: [],
  });
  // Load categories on component mount
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Clear messages after timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!openDialog) {
      setFormData({
        name: "",
        sku: "",
        price: "",
        category_id: "",
        description: "",
        images: [],
      });
      setIsDeleting(false);
      setIsEditing(false);
      dispatch(clearCurrentProduct());
      console.log("Dialog closed: All states reset, ready for new actions");
    }
  }, [openDialog, dispatch]);

  useEffect(() => {
    if (currentProduct) {
      setFormData({
        name: currentProduct.name,
        description: currentProduct.description || "",
      });
      // Ensure state are consistent
      if (isEditing) {
        setIsDeleting(false);
      } else if (isDeleting) {
        setIsEditing(false);
      }
    }
  }, [currentProduct, isEditing, isDeleting, dispatch]);

  const handleEditClick = (product) => {
    dispatch(setCurrentProduct(product));
    setIsEditing(true);
    setIsDeleting(false);
    setOpenDialog(true);
    console.log("Handle Edit Click: Dialog opened for editing", { isEditing });
  };
  const handleDeleteClick = (product) => {
    dispatch(setCurrentProduct(product));
    setIsDeleting(true);
    setIsEditing(false);
    setOpenDialog(true);
    console.log("Handle Delete Click: Dialog opened for deletion", {
      isDeleting,
    });
  };

  const handleRefresh = () => {
    dispatch(fetchProducts());
    console.log("Refresh triggered: Fetching latest categories");
  };

  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  return {
    productItems,
    loading,
    error,
    success,
    openDialog,
    isEditing,
    isDeleting,
    formData,
    setOpenDialog,
    setIsEditing,
    setFormData,
    handleEditClick,
    handleDeleteClick, // Return delete handler
    handleRefresh,
    handleCloseSnackbar,
    currentProduct,
  };
};
