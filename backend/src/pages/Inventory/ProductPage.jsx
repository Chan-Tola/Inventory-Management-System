import { useDispatch } from "react-redux";
import { useProduct } from "../../hooks/useProduct";
import { createProduct } from "../../redux/slices/productSlice";
import {
  ProductHeader,
  ProductForm,
  ProductTable,
} from "../../components/features/product/index";
import { Notification } from "../../components/common/index";
import { Box } from "@mui/material";
const ProductPage = () => {
  const dispatch = useDispatch();
  const {
    productItems,
    loading,
    success,
    openDialog,
    currentProduct,
    isEditing,
    isDeleting,
    formData,
    setOpenDialog,
    setFormData,
    handleEditClick,
    handleDeleteClick,
    handleCloseSnackbar,
    handleRefresh,
  } = useProduct();

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
  productItems.forEach((product) => {
    console.log("categoryname:", product.category.name);
    console.log("Images:", product.images);
    console.log("Images:", product.primary_image);
  });

  // note: function handleFormSubmit
  // const handleFormSubmit = isEditing
  //   ? handleUpdateProduct
  //   : handleCreateProduct;
  return (
    <>
      <Box p={3}>
        {/* Header */}
        <ProductHeader
          itemsCount={productItems.length}
          loading={loading}
          onRefresh={handleRefresh}
          onAddProduct={() => setOpenDialog(true)}
        />
        <Notification
          open={success}
          message="Operation completed successfully!"
          severity="success"
          onClose={handleCloseSnackbar}
          autoHideDuration={3000}
        />

        {/* Table Product */}
        <ProductTable
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          isEditing={isEditing}
          formData={formData}
          loading={loading}
          productItems={productItems}
          // onSubmit={handleFormSubmit}
          // onFormDataChange={setFormData}
          // onDelete={handleDeleteCategory}
          currentProduct={currentProduct}
        />

        {/* Form */}
        {/* <ProductForm /> */}
      </Box>
    </>
  );
};

export default ProductPage;
