import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  clearError,
  clearSuccess,
  setCurrentCategory,
  clearCurrentCategory,
  resetCategoryState,
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
      setFormData({ name: "", description: "" });
      setIsDeleting(false);
      setIsEditing(false);
      dispatch(clearCurrentCategory());
    }
  }, [openDialog, dispatch]);

  // Update formData when editing/deleting a category
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
  }, [currentCategory, isEditing, isDeleting]);

  // Reset entire category state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetCategoryState());
    };
  }, [dispatch]);

  // fucntion buttons
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
    currentCategory,
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
