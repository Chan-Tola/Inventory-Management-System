import { useDispatch } from "react-redux";
import { Box } from "@mui/material";
import { useCategory } from "../../hooks/useCategory";
import {
  CategoryHeader,
  CategoryTable,
  CategoryForm,
} from "../../components/features/category/index";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  fetchCategories,
} from "../../redux/slices/categorySlice";
import { Notification } from "../../components/common/index";
import { useCallback, useEffect, useRef, useState } from "react";

const CategoryIndex = () => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");

  // ✅ Ref to prevent double fetch even in StrictMode
  const hasFetched = useRef(false);

  // ✅ Load categories on component mount
  const handleRefresh = useCallback(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const {
    categoryItems,
    loading,
    success,
    openDialog,
    currentCategory,
    isEditing,
    isDeleting,
    formData,
    setOpenDialog,
    setFormData,
    handleEditClick,
    handleDeleteClick,
    handleCloseSnackbar,
  } = useCategory();

  // ✅ Single effect with proper cleanup
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      handleRefresh();
    }
  }, [handleRefresh]);

  // function filteritme base on Search
  const fileteredCategories = categoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchText.toLocaleLowerCase()) ||
      item.id.toString().includes(searchText)
  );

  // note:function create category
  const handleCreateCategory = async () => {
    try {
      await dispatch(createCategory(formData)).unwrap();
      setOpenDialog(false);
      handleRefresh();
    } catch (error) {
      console.log("Failed to create Category :", error);
    }
  };

  // note:function update category
  const handleUpdateCategory = async () => {
    if (!currentCategory || !currentCategory.id) {
      console.error("No current category selected for update");
      console.log(currentCategory);
      alert("No category selected for editing");
      return;
    }

    try {
      await dispatch(
        updateCategory({
          id: currentCategory.id,
          categoryData: formData,
        })
      ).unwrap();
      setOpenDialog(false);
      handleRefresh();
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  // Add the delete handler function
  const handleDeleteCategory = async () => {
    if (currentCategory) {
      try {
        await dispatch(deleteCategory(currentCategory.id)).unwrap();
        setOpenDialog(false);
        handleRefresh(); // Ensure refresh after delete
      } catch (error) {
        console.error("Failed to update category:", error);
        // 🔥 ADD USER-FRIENDLY ERROR MESSAGE
        alert(`Update failed: ${error.message}`);
      }
    }
  };

  const handleFormSubmit = isEditing
    ? handleUpdateCategory
    : handleCreateCategory;

  // fucntion search
  return (
    <>
      <Box p={3}>
        {/* Header */}
        <CategoryHeader
          itemsCount={categoryItems.length}
          searchText={searchText}
          setSearchText={setSearchText}
          loading={loading}
          onAddCategory={() => setOpenDialog(true)}
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
        <CategoryTable
          categoryItems={fileteredCategories}
          loading={loading}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
        {/* Add/Edit Category Form */}
        <CategoryForm
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          isEditing={isEditing}
          isDeleting={isDeleting}
          formData={formData}
          loading={loading}
          onSubmit={handleFormSubmit}
          onFormDataChange={setFormData}
          onDelete={handleDeleteCategory}
          currentCategory={currentCategory}
        />
      </Box>
    </>
  );
};

export default CategoryIndex;
