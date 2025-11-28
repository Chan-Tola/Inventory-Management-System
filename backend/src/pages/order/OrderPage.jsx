import { Box } from "@mui/material";
import { uesOrder } from "../../hooks/uesOrder";
import { useState } from "react";
import {
  OrderHeader,
  OrderTable,
  OrderDetailDialog,
} from "../../components/features/order/index";
import { Notification } from "../../components/common/index";
const OrderPage = () => {
  //   search state for order
  const [searchText, setSearchText] = useState("");
  const {
    orderItems,
    loading,
    error,
    success,
    openDialog,
    currentOrder,
    isViewing,
    setOpenDialog,
    handleViewClick,
    handleRefresh,
    handleCloseSnackbar,
    handleCloseDetail,
  } = uesOrder();

  // ✅ FIXED: Filter orders based on order_code
  const filteredOrders = orderItems.filter((item) =>
    item.order_code?.toLowerCase().includes(searchText.toLowerCase())
  );
  return (
    <div>
      <Box p={3}>
        {/* Header */}
        <OrderHeader
          itemsCount={orderItems.length}
          searchText={searchText}
          setSearchText={setSearchText}
        />

        {/* Notification */}
        <Notification
          open={success}
          message="Operation completed successfully!"
          severity="success"
          onClose={handleCloseSnackbar}
          autoHideDuration={3000}
        />

        {/* Transactions Table */}
        <OrderTable
          orderItems={filteredOrders}
          loading={loading}
          onView={handleViewClick} // ADD THIS
        />
        {/* Conditional Rendering based on mode */}
        {/* {isViewing && (
          // View Details Dialog
          <OrderDetailDialog
            open={openDialog}
            onClose={handleCloseDetail}
            transaction={currentOrder}
            loading={loading}
          />
        )} */}
      </Box>
    </div>
  );
};

export default OrderPage;
