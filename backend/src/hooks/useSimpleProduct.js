// hooks/useSimpleCategory.js
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { fetchProducts } from "../redux/slices/productSlice";

export const useSimpleProduct = () => {
  const dispatch = useDispatch();
  const { productItems, loading, error } = useSelector(
    (state) => state.products
  );

  const hasFetched = useRef(false);

  const fetchProductsManual = () => {
    dispatch(fetchProducts());
    hasFetched.current = true;
  };

  useEffect(() => {
    // Only fetch if we don't have categories yet
    if (productItems.length === 0) {
      // dispatch(fetchProducts());
      fetchProductsManual();
    }
  }, [dispatch, productItems.length]);

  return { productItems, loading, error, fetchProducts: fetchProductsManual };
};
