// hooks/useSimpleCategory.js
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchTransaction } from "../redux/slices/transactionSlice";

export const useSimpleTransaction = () => {
  const dispatch = useDispatch();
  const { transactionItems, loading } = useSelector(
    (state) => state.transactions
  );
  useEffect(() => {
    // Only fetch if we don't have categories yet
    if (transactionItems.length === 0) {
      dispatch(fetchTransaction());
    }
  }, [dispatch, transactionItems.length]);

  return { transactionItems, loading };
};