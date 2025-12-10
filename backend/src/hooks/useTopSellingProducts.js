import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTopSellingProducts,
  clearError,
  clearSuccess,
  resetTopSell,
} from "../redux/slices/topSellProductSlice";

export const useTopSellingProducts = () => {
  const dispatch = useDispatch();
  const {
    topSellProducts,
    loading,
    error,
    success,
    totalCount,
    totalSales,
    totalQuantity,
  } = useSelector((state) => state.topSellProducts);

  const hasReset = useRef(false);
  const hasFetched = useRef(false);

  // Fetch top selling products on mount
  useEffect(() => {
    if (!hasFetched.current) {
      dispatch(fetchTopSellingProducts());
      hasFetched.current = true;
    }
  }, [dispatch]);

  // Clear success after 3s
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // Clear error after 5s
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Reset entire topSell state when component unmounts
  useEffect(() => {
    return () => {
      if (!hasReset.current) {
        hasReset.current = true;
        dispatch(resetTopSell());
      }
    };
  }, [dispatch]);

  // Function to refresh top selling products
  const refreshTopSellingProducts = () => {
    dispatch(fetchTopSellingProducts());
  };

  // Function to clear errors manually
  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  // Calculate top performing product (rank #1)
  const topPerformer = topSellProducts.length > 0 ? topSellProducts[0] : null;

  // Calculate average sales per product
  const averageSalesPerProduct =
    totalCount > 0 ? (totalSales / totalCount).toFixed(2) : 0;

  // Check if there are products in stock
  const hasProductsInStock = topSellProducts.some(
    (product) => product.is_in_stock
  );

  // Get products that need restock (low or no stock)
  const productsNeedRestock = topSellProducts.filter(
    (product) => !product.is_in_stock || product.current_stock < 5
  );

  return {
    // Data
    topSellProducts,
    totalCount,
    totalSales,
    totalQuantity,

    // State
    loading,
    error,
    success,

    // Calculated values
    topPerformer,
    averageSalesPerProduct,
    hasProductsInStock,
    productsNeedRestock,

    // Actions
    refreshTopSellingProducts,
    handleCloseSnackbar,
  };
};
