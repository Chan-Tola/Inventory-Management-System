// hooks/useSimpleCategory.js
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchSuppliers } from "../redux/slices/supplierSlice";

export const useSimpleSupplier = () => {
  const dispatch = useDispatch();
  const { supplierItems, loading } = useSelector((state) => state.suppliers);

  useEffect(() => {
    // Only fetch if we don't have categories yet
    if (supplierItems.length === 0) {
      dispatch(fetchSuppliers());
    }
  }, [dispatch, supplierItems.length]);

  return { supplierItems, loading };
};
