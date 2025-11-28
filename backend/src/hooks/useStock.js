import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStocks,
  clearError,
  clearSuccess,
  clearCurrentStock,
  setCurrentStock,
  resetStockState,
} from "../redux/slices/stockSlice";

export const useStock = () => {
  const dispatch = useDispatch();
  const { stockItems, loading, error, success, currentStock } = useSelector(
    (state) => state.stocks
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    product_id: "",
    quantity: "",
    min_quantity: "",
    price: "",
    unit: "",
  });

  // ✅ Ref to prevent double fetch even in StrictMode
  const hasFetched = useRef(false);
  // Load stocks on component mount
  const handleRefresh = useCallback(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      dispatch(fetchStocks());
    }
  }, [dispatch]);
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
      setFormData({ product_id: "", quantity: "", min_quantity: "", unit: "" });
      setIsDeleting(false);
      setIsEditing(false);
      // dispatch(clearCurrentStock());
    }
  }, [openDialog, dispatch]);

  // Update formData when editing/deleting a category
  useEffect(() => {
    if (currentStock) {
      setFormData({
        product_id: currentStock.product_id,
        quantity: currentStock.quantity,
        min_quantity: currentStock.min_quantity,
        unit: currentStock.unit,
      });
      // Ensure state are consistent
      if (isEditing) {
        setIsDeleting(false);
      } else if (isDeleting) {
        setIsEditing(false);
      }
    }
  }, [currentStock, isEditing, isDeleting]);

  // Reset entire category state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetStockState());
    };
  }, [dispatch]);

  // fucntion buttons
  const handleEditClick = () => {
    console.log("Handle Edit Click: Dialog opened for editing", { isEditing });
  };
  const handleDeleteClick = () => {
    console.log("Handle Delete Click: Dialog opened for deletion", {
      isDeleting,
    });
  };
  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  return {
    stockItems,
    loading,
    error,
    success,
    currentStock,
    openDialog,
    isEditing,
    isDeleting,
    formData,
    setFormData,
    setOpenDialog,
    handleEditClick,
    handleDeleteClick,
    handleRefresh,
    handleCloseSnackbar,
  };
};
