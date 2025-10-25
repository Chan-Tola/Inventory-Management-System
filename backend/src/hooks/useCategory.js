import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  clearError,
  clearSuccess,
  setCurrentCategory,
  clearCurrentCategory,
} from "../redux/slices/categorySlice";

export const useCategory = () => {
  const dispatch = useDispatch();
  const { categoryItems, loading, error, success, currentCategory } =
    useSelector((state) => state.categories);

  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  // Load categories on component mount
  useEffect(() => {
    dispatch(fetchCategories());
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
      setFormData({ name: "", description: "" });
      setIsDeleting(false);
      setIsEditing(false);
      dispatch(clearCurrentCategory());
      console.log("Dialog closed: All states reset, ready for new actions");
    }
  }, [openDialog, dispatch]);

  useEffect(() => {
    if (currentCategory) {
      setFormData({
        name: currentCategory.name,
        description: currentCategory.description || "",
      });
      // Ensure state are consistent
      if (isEditing) {
        setIsDeleting(false);
      } else if (isDeleting) {
        setIsEditing(false);
      }
    }
  }, [currentCategory, isEditing, isDeleting, dispatch]);

  const handleEditClick = (category) => {
    dispatch(setCurrentCategory(category));
    setIsEditing(true);
    setIsDeleting(false);
    setOpenDialog(true);
    console.log("Handle Edit Click: Dialog opened for editing", { isEditing });
  };
  const handleDeleteClick = (category) => {
    dispatch(setCurrentCategory(category));
    setIsDeleting(true);
    setIsEditing(false);
    setOpenDialog(true);
    console.log("Handle Delete Click: Dialog opened for deletion", {
      isDeleting,
    });
  };

  const handleRefresh = () => {
    dispatch(fetchCategories());
    console.log("Refresh triggered: Fetching latest categories");
  };

  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  return {
    categoryItems,
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
    currentCategory,
  };
};
