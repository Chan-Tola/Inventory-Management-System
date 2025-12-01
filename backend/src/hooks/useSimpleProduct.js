// hooks/useSimpleCategory.js
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchProducts } from "../redux/slices/productSlice";

export const useSimpleProduct = () => {
  const dispatch = useDispatch();
  const { productItems, loading } = useSelector((state) => state.products);

  useEffect(() => {
    // Only fetch if we don't have categories yet
    if (productItems.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, productItems.length]);

  return { productItems, loading };
};
