import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  fetchOrder, // order get by id
  clearError,
  clearSuccess,
  setCurrentOrder,
  clearCurrentOrder,
  resetOrderState,
} from "../redux/slices/orderSlice";
export const uesOrder = () => {
  const dispatch = useDispatch();
  const { orderItems, loading, error, success, currentOrder } = useSelector(
    (state) => state.orders
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  //   load orders on component mount
  const hasFetched = useRef(false);
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      dispatch(fetchOrders());
    }
  }, [dispatch]);

  //   Clear success after 3s
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  //   Clear error after 5s
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Reset entire transaction state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetOrderState());
    };
  }, [dispatch]);
  // fetch order by id
  const fetchOrderById = (orderId) => {
    dispatch(fetchOrder(orderId));
  };
  //   button view click hand
  const handleViewClick = (order) => {
    dispatch(setCurrentOrder(order));
    setIsViewing(true);
    setOpenDialog(true);
  };
  const handleCloseDetail = () => {
    setOpenDialog(false);
    setIsViewing(false);
    dispatch(clearCurrentOrder());
  };

  const handleRefresh = () => {
    dispatch(fetchOrderById());
  };
  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };
  return {
    // state
    orderItems,
    loading,
    error,
    success,
    currentOrder,
    openDialog,
    isViewing,

    // setters
    setOpenDialog,

    // actions
    handleRefresh,
    handleViewClick,
    handleCloseDetail,
    fetchOrderById,
    handleCloseSnackbar,
  };
};
