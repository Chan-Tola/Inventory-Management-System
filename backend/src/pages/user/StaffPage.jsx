import { useDispatch } from "react-redux";
import { Box } from "@mui/material";
import { useState } from "react";
import { useStaff } from "../../hooks/useStaff";
import {
  StaffHeader,
  StaffTable,
  StaffForm,
} from "../../components/features/staffs/index";
import { Notification } from "../../components/common/index";
import { createStaff } from "../../redux/slices/staffSlice";

const StaffPage = () => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const {
    staffItems,
    loading,
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
  } = useStaff();

  console.log("Staff Items:", staffItems);
  // function filteritme base on Search
  const fileteredStaffs = staffItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchText.toLocaleLowerCase()) ||
      item.staff?.staff_code
        .toLowerCase()
        .includes(searchText.toLocaleLowerCase())
  );
  // note:function create staff
  const handleCreateStaff = async () => {
    try {
      await dispatch(createStaff(formData)).unwrap();
      setOpenDialog(false);
      handleRefresh();
    } catch (error) {
      console.log("Failed to create Staff :", error);
    }
  };
  // note:function update staff
  // function update product
  const handleUpdateStaff = async () => {
    if (!currentStaff || !currentStaff.id) {
      console.error("No current staff selected for update");
      console.log(currentStaff);
      alert("No staff selected for editing");
      return;
    }
    try {
      await dispatch(
        updateProduct({
          id: currentStaff.id,
          StaffData: formData,
        })
      ).unwrap();
      setOpenDialog(false);
      handleRefresh();
    } catch (error) {
      console.error("Failed to update staff:", error);
    }
  };
  // const handleUpdateStaff = async () => {
  //   if (!currentStaff || !currentStaff.id) {
  //     console.error("No current staff selected for update");
  //     alert("No staff selected for editing");
  //     return;
  //   }
  //   try {
  //     await dispatch();
  //   } catch (error) {
  //     console.log("Failed to update Staff :", error);
  //   }
  // };
  // note:function delete staff

  // note: function handleFormSubmit
  const handleFormSubmit = isEditing ? handleUpdateStaff : handleCreateStaff;
  return (
    <>
      <Box p={3}>
        {/* Header */}
        <StaffHeader
          itemsCount={staffItems.length}
          loading={loading}
          searchText={searchText}
          setSearchText={setSearchText}
          onAddStaff={() => setOpenDialog(true)}
        />
        {/* Notification */}
        <Notification
          open={success}
          message="Operation completed successfully!"
          severity="success"
          onClose={handleCloseSnackbar}
          autoHideDuration={3000}
        />
        {/* Table Staff */}
        <StaffTable
          staffItems={fileteredStaffs}
          loading={loading}
          onEdit={handleEditClick}
          onRefresh={handleRefresh}
        />
        {/* Add/Edit Staff Form */}
        <StaffForm
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          isEditing={isEditing}
          isDeleting={isDeleting}
          formData={formData}
          loading={loading}
          onSubmit={handleFormSubmit}
          onFormDataChange={setFormData}
          currentStaff={currentStaff}
          // onDelete={handleDeleteStaff}
        />
      </Box>
    </>
  );
};

export default StaffPage;
