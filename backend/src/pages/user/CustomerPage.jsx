import { useDispatch } from "react-redux";
import { Box } from "@mui/material";
import { useState } from "react";
import { useCustomer } from "../../hooks/useCustomer";
import {
  CustomerHeader,
  CustomerTable,
  CustomerForm,
} from "../../components/features/customers/index";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../redux/slices/customerSlice";
import { Notification } from "../../components/common/index";

const CustomerPage = () => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");

  const {
    customerItems,
    loading,
    success,
    openDialog,
    currentCustomer,
    isEditing,
    isDeleting,
    formData,
    setOpenDialog,
    setFormData,
    handleEditClick,
    handleRefresh,
    handleDeleteClick,
    handleCloseSnackbar,
  } = useCustomer();

  // function filteritme base on Search
  const fileteredCustomers = customerItems.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLocaleLowerCase())
  );

  // note:function create category
  const handleCreateCustomer = async () => {
    try {
      await dispatch(createCustomer(formData)).unwrap();
      setOpenDialog(false);
      handleRefresh();
    } catch (error) {
      console.log("Failed to create customer :", error);
    }
  };

  // note:function update category
  const handleUpdateCustomer = async () => {
    if (!currentCustomer || !currentCustomer.id) {
      console.error("No current customer selected for update");
      console.log(currentCustomer);
      alert("No customer selected for editing");
      return;
    }

    try {
      await dispatch(
        updateCustomer({
          id: currentCustomer.id,
          customerData: formData,
        })
      ).unwrap();
      setOpenDialog(false);
      handleRefresh();
    } catch (error) {
      console.error("Failed to update customer:", error);
    }
  };

  // Add the delete handler function
  const handleDeleteCustomer = async () => {
    if (currentCustomer) {
      try {
        await dispatch(deleteCustomer(currentCustomer.id)).unwrap();
        setOpenDialog(false);
        handleRefresh(); // Ensure refresh after delete
      } catch (error) {
        console.error("Failed to delete customer:", error);
        // 🔥 ADD USER-FRIENDLY ERROR MESSAGE
        alert(`delete failed: ${error.message}`);
      }
    }
  };

  const handleFormSubmit = isEditing
    ? handleUpdateCustomer
    : handleCreateCustomer;

  // fucntion search
  return (
    <>
      <Box p={3}>
        {/* Header */}
        <CustomerHeader
          itemsCount={customerItems.length}
          searchText={searchText}
          setSearchText={setSearchText}
          loading={loading}
          onAddCustomer={() => setOpenDialog(true)}
        />
        {/* Notification */}
        <Notification
          open={success}
          message="Operation completed successfully!"
          severity="success"
          onClose={handleCloseSnackbar}
          autoHideDuration={3000}
        />

        {/* Categories Table */}
        <CustomerTable
          customerItems={fileteredCustomers}
          loading={loading}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onRefresh={handleRefresh} // Add this prop
        />
        {/* Add/Edit Category Form */}
        <CustomerForm
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          isEditing={isEditing}
          isDeleting={isDeleting}
          formData={formData}
          loading={loading}
          onSubmit={handleFormSubmit}
          onFormDataChange={setFormData}
          onDelete={handleDeleteCustomer}
          currentCustomer={currentCustomer}
        />
      </Box>
    </>
  );
};

export default CustomerPage;
