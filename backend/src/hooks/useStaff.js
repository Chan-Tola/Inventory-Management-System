import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStaffs,
  clearError,
  clearSuccess,
  setCurrentStaff,
  clearCurrentStaff,
  resetStaffState,
} from "../redux/slices/staffSlice";

export const useStaff = () => {
  const dispatch = useDispatch();
  const { staffItems, loading, error, success, currentStaff } = useSelector(
    (state) => state.staffs
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    phone: "",
    address: "",
    salary: "",
    hire_date: "",
    profile_url: "",
    roles: "",
  });

  // Load staffs on component mount
  useEffect(() => {
    dispatch(fetchStaffs());
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
      setFormData({
        name: "",
        email: "",
        password: "",
        gender: "",
        phone: "",
        address: "",
        salary: "",
        hire_date: "",
        profile_url: "",
        roles: "default",
      });
      setIsDeleting(false);
      setIsEditing(false);
      dispatch(clearCurrentStaff());
    }
  }, [openDialog, dispatch]);

  // Update formData when editing/deleting a staff
  useEffect(() => {
    if (currentStaff) {
      setFormData({
        name: currentStaff.name,
        gender: currentStaff.staff.gender,
        phone: currentStaff.staff.phone,
        address: currentStaff.staff.address,
        salary: currentStaff.staff.salary,
        profile_url: currentStaff.staff.profile_url,
      });
      // Ensure state are consistent
      if (isEditing) {
        setIsDeleting(false);
      } else if (isDeleting) {
        setIsEditing(false);
      }
    }
  }, [currentStaff, isEditing, isDeleting]);

  // Reset entire category state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetStaffState());
    };
  }, [dispatch]);

  // fucntion buttons
  const handleEditClick = (staffInfo) => {
    dispatch(setCurrentStaff(staffInfo));
    setIsEditing(true);
    setIsDeleting(false);
    setOpenDialog(true);
    console.log("Handle Edit Click: Dialog opened for editing", {
      isEditing,
    });
  };

  const handleDeleteClick = (staffInfo) => {
    dispatch(setCurrentStaff(staffInfo));
    setIsDeleting(true);
    setIsEditing(false);
    setOpenDialog(true);
    console.log("Handle Delete Click: Dialog opened for deletion", {
      isDeleting,
    });
  };

  const handleRefresh = () => {
    dispatch(fetchStaffs());
    console.log("Refresh triggered: Fetching latest categories");
  };

  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  return {
    staffItems,
    loading,
    error,
    success,
    currentStaff,
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
