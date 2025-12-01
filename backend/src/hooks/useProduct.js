import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearError,
  clearSuccess,
  setCurrentProduct,
  clearCurrentProduct,
  resetProductState,
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
    brand: "",
    category_id: "",
    description: "",
    images: [],
  });

  const hasReset = useRef(false);
  
  // Clear success after 3s
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // Clear error after 5s
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Reset form and dialog state when closed
  useEffect(() => {
    if (!openDialog) {
      setFormData({
        name: "",
        sku: "",
        price: "",
        brand: "",
        category_id: "",
        description: "",
        images: [],
      });
      setIsDeleting(false);
      setIsEditing(false);
      dispatch(clearCurrentProduct());
    }
  }, [openDialog, dispatch]);

  // Update formData when editing/deleting a product
  useEffect(() => {
    if (currentProduct) {
      setFormData({
        name: currentProduct.name,
        sku: currentProduct.sku,
        price: currentProduct.price,
        brand: currentProduct.brand,
        category_id: currentProduct.category_id,
        description: currentProduct.description || "",
        images: currentProduct.images,
      });
      // Ensure state are consistent
      if (isEditing) {
        setIsDeleting(false);
      } else if (isDeleting) {
        setIsEditing(false);
      }
    }
  }, [currentProduct, isEditing, isDeleting]);

  // Reset entire category state when component unmounts
  useEffect(() => {
    return () => {
      if (!hasReset.current) {
        hasReset.current = true;
        dispatch(resetProductState());
      }
    };
  }, [dispatch]);

  // fucntion buttons
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

  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  return {
    productItems,
    loading,
    error,
    success,
    currentProduct,
    openDialog,
    isEditing,
    isDeleting,
    formData,
    setFormData,
    setOpenDialog,
    setIsEditing,
    handleEditClick,
    handleDeleteClick,
    handleCloseSnackbar,
  };
};
