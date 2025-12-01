import { useDispatch } from "react-redux";
import { Box } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSupplier } from "../../hooks/useSupplier";
import {
  SupplierHeader,
  SupplierTable,
  SupplierForm,
} from "../../components/features/supplier/index";
import {
  createSupplier,
  updateSupplier,
  deleteSupplier,
  fetchSuppliers,
} from "../../redux/slices/supplierSlice";
import { Notification } from "../../components/common/index";

const SupplierPage = () => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");

  const hasFetched = useRef(false);
  // Load products on component mount
  const handleRefresh = useCallback(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const {
    supplierItems,
    loading,
    success,
    openDialog,
    currentSupplier,
    isEditing,
    isDeleting,
    formData,
    setOpenDialog,
    setFormData,
    handleEditClick,
    handleDeleteClick,
    handleCloseSnackbar,
  } = useSupplier();

  // ✅ Only call once
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      handleRefresh();
    }
  }, [handleRefresh]);
  // function filteritme base on Search
  const fileteredSuppliers = supplierItems.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLocaleLowerCase())
  );

  // note:function create category
  const handleCreateSupplier = async () => {
    try {
      await dispatch(createSupplier(formData)).unwrap();
      setOpenDialog(false);
      handleRefresh();
    } catch (error) {
      console.log("Failed to create supplier :", error);
    }
  };

  // note:function update category
  const handleUpdateSuplier = async () => {
    if (!currentSupplier || !currentSupplier.id) {
      console.error("No current supplier selected for update");
      console.log(currentSupplier);
      alert("No supplier selected for editing");
      return;
    }

    try {
      await dispatch(
        updateSupplier({
          id: currentSupplier.id,
          supplierData: formData,
        })
      ).unwrap();
      setOpenDialog(false);
      handleRefresh();
    } catch (error) {
      console.error("Failed to update supplier:", error);
    }
  };

  // Add the delete handler function
  const handleDeleteSuplier = async () => {
    if (currentSupplier) {
      try {
        await dispatch(deleteSupplier(currentSupplier.id)).unwrap();
        setOpenDialog(false);
        handleRefresh(); // Ensure refresh after delete
      } catch (error) {
        console.error("Failed to delete supplier:", error);
        // 🔥 ADD USER-FRIENDLY ERROR MESSAGE
        alert(`delete failed: ${error.message}`);
      }
    }
  };

  const handleFormSubmit = isEditing
    ? handleUpdateSuplier
    : handleCreateSupplier;

  // fucntion search
  return (
    <>
      <Box p={3}>
        {/* Header */}
        <SupplierHeader
          itemsCount={supplierItems.length}
          searchText={searchText}
          setSearchText={setSearchText}
          loading={loading}
          onAddSupplier={() => setOpenDialog(true)}
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
        <SupplierTable
          supplierItems={fileteredSuppliers}
          loading={loading}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
        {/* Add/Edit Category Form */}
        <SupplierForm
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          isEditing={isEditing}
          isDeleting={isDeleting}
          formData={formData}
          loading={loading}
          onSubmit={handleFormSubmit}
          onFormDataChange={setFormData}
          onDelete={handleDeleteSuplier}
          currentSupplier={currentSupplier}
        />
      </Box>
    </>
  );
};

export default SupplierPage;
