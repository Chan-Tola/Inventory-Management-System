// hooks/useSimpleCategory.js
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { fetchSuppliers } from "../redux/slices/supplierSlice";

export const useSimpleSupplier = () => {
  const dispatch = useDispatch();
  const { supplierItems, loading, error } = useSelector(
    (state) => state.suppliers
  );
  const hasFetched = useRef(false);

  const fetchSuppliersManual = () => {
    dispatch(fetchSuppliers());
    hasFetched.current = true;
  };
  useEffect(() => {
    // Only fetch if we don't have categories yet
    if (supplierItems.length === 0) {
      // dispatch(fetchSuppliers());
      fetchSuppliersManual();
    }
  }, [dispatch, supplierItems.length]);

  return {
    supplierItems,
    loading,
    error,
    fetchSuppliers: fetchSuppliersManual, // Export manual fetch function
  };
};
