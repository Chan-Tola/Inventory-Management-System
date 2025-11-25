import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomers,
  clearError,
  clearSuccess,
  setCurrentCustomer,
  clearCurrentCustomer,
  resetCustomerState,
} from "../redux/slices/customerSlice";

export const useCustomer = () => {
  const dispatch = useDispatch();
  const { customerItems, loading, error, success, currentCustomer } =
    useSelector((state) => state.customers);

  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    address: "",
  });

  // Load suppliers on component mount
  useEffect(() => {
    dispatch(fetchCustomers());
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
      setFormData({ name: "", gender: "", address: "" });
      setIsDeleting(false);
      setIsEditing(false);
      dispatch(clearCurrentCustomer());
    }
  }, [openDialog, dispatch]);

  // Update formData when editing/deleting a suppliers
  useEffect(() => {
    if (currentCustomer) {
      setFormData({
        name: currentCustomer.name,
        gender: currentCustomer.customer.gender,
        address: currentCustomer.customer.address,
      });
      // Ensure state are consistent
      if (isEditing) {
        setIsDeleting(false);
      } else if (isDeleting) {
        setIsEditing(false);
      }
    }
  }, [currentCustomer, isEditing, isDeleting]);

  // Reset entire suppliers state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetCustomerState());
    };
  }, [dispatch]);

  // fucntion buttons
  const handleEditClick = (customers) => {
    dispatch(setCurrentCustomer(customers));
    setIsEditing(true);
    setIsDeleting(false);
    setOpenDialog(true);
    console.log("Handle Edit Click: Dialog opened for editing", { isEditing });
  };
  const handleDeleteClick = (customers) => {
    dispatch(setCurrentCustomer(customers));
    setIsDeleting(true);
    setIsEditing(false);
    setOpenDialog(true);
    console.log("Handle Delete Click: Dialog opened for deletion", {
      isDeleting,
    });
  };

  const handleRefresh = () => {
    dispatch(fetchCustomers());
  };

  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  return {
    customerItems,
    loading,
    error,
    success,
    currentCustomer,
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
