import { useDispatch } from "react-redux";
import { Box } from "@mui/material";
import { uesOrder } from "../../hooks/uesOrder";
import { useState, useCallback, useEffect, useRef } from "react";
import { fetchOrders } from "../../redux/slices/orderSlice";
import {
  OrderHeader,
  OrderTable,
} from "../../components/features/order/index";
import { Notification } from "../../components/common/index";
const OrderPage = () => {
  const dispatch = useDispatch();
  //   search state for order
  const [searchText, setSearchText] = useState("");

  const hasFetched = useRef(false);
  // ✅ Only call once
  const handleRefresh = useCallback(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

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
    handleCloseSnackbar,
    handleCloseDetail,
  } = uesOrder();

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      handleRefresh();
    }
  });

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
