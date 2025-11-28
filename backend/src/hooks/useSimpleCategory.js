// hooks/useSimpleCategory.js
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchCategories } from "../redux/slices/categorySlice";

export const useSimpleCategory = () => {
  const dispatch = useDispatch();
  const { categoryItems, loading } = useSelector((state) => state.categories);

  useEffect(() => {
    // Only fetch if we don't have categories yet
    if (categoryItems.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categoryItems.length]);

  return { categoryItems, loading };
};
