import { useDispatch } from "react-redux";
import { Box } from "@mui/material";
import { useState } from "react";
import { useProduct } from "../../hooks/useProduct";
import { useCategory } from "../../hooks/useCategory";
import {
  ProductHeader,
  ProductForm,
  ProductTable,
} from "../../components/features/product/index";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../redux/slices/productSlice";
import { Notification } from "../../components/common/index";
const ProductPage = () => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const { categoryItems } = useCategory();
  const {
    productItems,
    loading,
    success,
    currentProduct,
    openDialog,
    isEditing,
    isDeleting,
    formData,
    setFormData,
    setOpenDialog,
    handleEditClick,
    handleDeleteClick,
    handleRefresh,
    handleCloseSnackbar,
  } = useProduct();

  // function filteritme base on Search
  const fileteredProducts = productItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchText.toLocaleLowerCase()) ||
      item.id.toString().includes(searchText)
  );
  // note: fucntion create product
  const handleCreateProduct = async () => {
    try {
      await dispatch(createProduct(formData)).unwrap();
      setOpenDialog(false);
      handleRefresh();
    } catch (error) {
      console.log("Failed to create Product :", error);
    }
  };
  // function update product
  const handleUpdateProduct = async () => {
    if (!currentProduct || !currentProduct.id) {
      console.error("No current product selected for update");
      console.log(currentProduct);
      alert("No product selected for editing");
      return;
    }
    try {
      await dispatch(
        updateProduct({
          id: currentProduct.id,
          productData: formData,
        })
      ).unwrap();
      setOpenDialog(false);
      handleRefresh();
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  // function delete product
  const handleDeleteProduct = async () => {
    if (currentProduct) {
      try {
        await dispatch(deleteProduct(currentProduct.id)).unwrap();
        setOpenDialog(false);
        handleRefresh();
      } catch (error) {
        console.error("Failed to update category:", error);
        // 🔥 ADD USER-FRIENDLY ERROR MESSAGE
        alert(`Update failed: ${error.message}`);
      }
    }
  };

  // note: function handleFormSubmit
  const handleFormSubmit = isEditing
    ? handleUpdateProduct
    : handleCreateProduct;

  return (
    <>
      <Box p={3}>
        {/* Header */}
        <ProductHeader
          itemsCount={productItems.length}
          searchText={searchText}
          setSearchText={setSearchText}
          loading={loading}
          onRefresh={handleRefresh}
          onAddProduct={() => setOpenDialog(true)}
        />
        {/* Notification */}
        <Notification
          open={success}
          message="Operation completed successfully!"
          severity="success"
          onClose={handleCloseSnackbar}
          autoHideDuration={3000}
        />

        {/* Table Product */}
        <ProductTable
          productItems={fileteredProducts}
          loading={loading}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onRefresh={handleRefresh}
        />

        {/* Add/Edit Product Form */}
        <ProductForm
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          isEditing={isEditing}
          isDeleting={isDeleting}
          formData={formData}
          loading={loading}
          onSubmit={handleFormSubmit}
          onFormDataChange={setFormData}
          categories={categoryItems}
          currentProduct={currentProduct}
          onDelete={handleDeleteProduct}
        />
      </Box>
    </>
  );
};

export default ProductPage;
