import { useDispatch } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { useStock } from "../../hooks/useStock";
import {
  StockHeader,
  StockTable,
} from "../../components/features/stocks/index";
import {
  createStock,
  updateStock,
  fetchStocks,
} from "../../redux/slices/stockSlice";
import { Notification } from "../../components/common/index";
const StockPage = () => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");

  const hasFetched = useRef(false);

  const handleRefresh = useCallback(() => {
    dispatch(fetchStocks());
  }, [dispatch]);

  const {
    stockItems,
    loading,
    success,
    currentStock,
    isEditing,
    formData,
    setOpenDialog,
    handleEditClick,
    handleDeleteClick,
    handleCloseSnackbar,
  } = useStock();

  // ✅ Only call once
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      handleRefresh();
    }
  }, [handleRefresh]);

  // function filteritme base on Search
  const filteredStocks = stockItems.filter((stock) => {
    return stock.product?.name
      ?.toLowerCase()
      .includes(searchText.toLowerCase());
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
          loading={loading}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </Box>
    </>
  );
};

export default StockPage;
