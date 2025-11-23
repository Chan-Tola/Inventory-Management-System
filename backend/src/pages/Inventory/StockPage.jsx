import { useDispatch } from "react-redux";
import { useState } from "react";
import { Box } from "@mui/material";
import { useProduct } from "../../hooks/useProduct";
import { useStock } from "../../hooks/useStock";
import {
  StockHeader,
  StockTable,
  StockForm,
} from "../../components/features/stocks/index";
import { createStock, updateStock } from "../../redux/slices/stockSlice";
import { Notification } from "../../components/common/index";
const StockPage = () => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const { productItems } = useProduct();
  const {
    stockItems,
    loading,
    success,
    currentStock,
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
  } = useStock();
  // function filteritme base on Search
  const filteredStocks = stockItems.filter((stock) => {
    const product = productItems.find((p) => p.id === stock.product_id);
    if (!product) return false;

    return product.name.toLowerCase().includes(searchText.toLowerCase());
  });
  // note: fucntion create product
  const handleCreateStock = async () => {
    try {
      await dispatch(createStock(formData)).unwrap();
      setOpenDialog(false);
      handleRefresh();
    } catch (error) {
      console.log("Failed to create Stock :", error);
    }
  };
  // function update product
  const handleUpdateStock = async () => {
    if (!currentStock || !currentStock.id) {
      console.error("No current stock selected for update");
      console.log(currentStock);
      alert("No stock selected for editing");
      return;
    }
    try {
      await dispatch(
        updateStock({
          id: currentStock.id,
          stockData: formData,
        })
      ).unwrap();
      setOpenDialog(false);
      handleRefresh();
    } catch (error) {
      console.error("Failed to update stock:", error);
    }
  };

  // note: function handleFormSubmit
  const handleFormSubmit = isEditing ? handleUpdateStock : handleCreateStock;
  return (
    <>
      <Box p={3}>
        {/* Header */}
        <StockHeader
          itemsCount={stockItems.length}
          searchText={searchText}
          setSearchText={setSearchText}
          loading={loading}
          onRefresh={handleRefresh}
          onAddStock={() => setOpenDialog(true)}
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
        <StockTable
          stockItems={filteredStocks}
          productItems={productItems}
          loading={loading}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onRefresh={handleRefresh} // Add this prop
        />
        {/* Add/Edit Category Form */}
        <StockForm
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          isEditing={isEditing}
          isDeleting={isDeleting}
          formData={formData}
          loading={loading}
          onSubmit={handleFormSubmit}
          onFormDataChange={setFormData}
          currentStock={currentStock}
        />
      </Box>
    </>
  );
};

export default StockPage;
