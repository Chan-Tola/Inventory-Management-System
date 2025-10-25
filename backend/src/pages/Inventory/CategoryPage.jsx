import { useDispatch } from "react-redux";
import { Box } from "@mui/material";
import { useCategory } from "../../hooks/useCategory";
import {
  CategoryHeader,
  CategoryTable,
  CategoryForm,
} from "../../components/features/category/index";
import { Notification } from "../../components/common/index";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../redux/slices/categorySlice";

const CategoryIndex = () => {
  const dispatch = useDispatch();
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
    handleRefresh,
    handleDeleteClick,
    handleCloseSnackbar,
  } = useCategory();

  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      alert("Category name is required");
      return;
    }
    try {
      await dispatch(createCategory(formData)).unwrap();
      setOpenDialog(false);
      handleRefresh();
    } catch (error) {
      console.log("Failed to create Category :", error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!formData.name.trim()) {
      alert("Category name is required");
      return;
    } // Add safety check for currentCategory
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
        console.error("Failed to delete category:", error);
      }
    }
  };

  const handleFormSubmit = isEditing
    ? handleUpdateCategory
    : handleCreateCategory;

  return (
    <>
      <Box p={3}>
        {/* Header */}
        <CategoryHeader
          itemsCount={categoryItems.length}
          loading={loading}
          onRefresh={handleRefresh}
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
          categoryItems={categoryItems}
          loading={loading}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onRefresh={handleRefresh} // Add this prop
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
