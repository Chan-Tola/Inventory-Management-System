  import { useEffect, useRef, useState } from "react";
  import { useDispatch, useSelector } from "react-redux";
  import {
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
    const [isPdfExport, setIsPdfExport] = useState(false); // Add viewing state

    //   load orders on component mount
    const hasReset = useRef(false);

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
      if (!hasReset.current) {
        return () => {
          dispatch(resetOrderState());
        };
      }
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

    // In your useTransaction hook
    const handleViewPDF = (order) => {
      // Optional: You can keep this if you want, or remove it
      console.log("Navigating to PDF page for:", order.id);

      // Store data and navigate
      localStorage.setItem("pdfOrderData", JSON.stringify(order));
      navigate(`/orders/${order.id}/pdf`);
    };

    const handleCloseDetail = () => {
      setOpenDialog(false);
      setIsViewing(false);
      dispatch(clearCurrentOrder());
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
      isPdfExport,

      // setters
      setOpenDialog,
      setIsPdfExport,

      // actions
      handleViewClick,
      handleViewPDF,
      handleCloseDetail,
      fetchOrderById,
      handleCloseSnackbar,
    };
  };
