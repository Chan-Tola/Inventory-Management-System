import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSuppliers,
  clearError,
  clearSuccess,
  setCurrentSupplier,
  clearCurrentSupplier,
  resetSupplierState,
} from "../redux/slices/supplierSlice";

export const useSupplier = () => {
  const dispatch = useDispatch();
  const { supplierItems, loading, error, success, currentSupplier } =
    useSelector((state) => state.suppliers);

  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    address: "",
  });

  // Load suppliers on component mount
  useEffect(() => {
    dispatch(fetchSuppliers());
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
      setFormData({ name: "", contact: "", address: "" });
      setIsDeleting(false);
      setIsEditing(false);
      dispatch(clearCurrentSupplier());
    }
  }, [openDialog, dispatch]);

  // Update formData when editing/deleting a suppliers
  useEffect(() => {
    if (currentSupplier) {
      setFormData({
        name: currentSupplier.name,
        contact: currentSupplier.contact,
        address: currentSupplier.address,
      });
      // Ensure state are consistent
      if (isEditing) {
        setIsDeleting(false);
      } else if (isDeleting) {
        setIsEditing(false);
      }
    }
  }, [currentSupplier, isEditing, isDeleting]);

  // Reset entire suppliers state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetSupplierState());
    };
  }, [dispatch]);

  // fucntion buttons
  const handleEditClick = (suppliers) => {
    dispatch(setCurrentSupplier(suppliers));
    setIsEditing(true);
    setIsDeleting(false);
    setOpenDialog(true);
    console.log("Handle Edit Click: Dialog opened for editing", { isEditing });
  };
  const handleDeleteClick = (suppliers) => {
    dispatch(setCurrentSupplier(suppliers));
    setIsDeleting(true);
    setIsEditing(false);
    setOpenDialog(true);
    console.log("Handle Delete Click: Dialog opened for deletion", {
      isDeleting,
    });
  };

  const handleRefresh = () => {
    dispatch(fetchSuppliers());
  };

  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  return {
    supplierItems,
    loading,
    error,
    success,
    currentSupplier,
    openDialog,
    isEditing,
    isDeleting,
    formData,
    setFormData,
    setOpenDialog,
    setIsEditing,
    handleEditClick,
    handleDeleteClick,
    handleRefresh,
    handleCloseSnackbar,
  };
};
