import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTransaction, // transactioin get by id
  clearError,
  clearSuccess,
  setCurrentTransaction,
  clearCurrentTransaction,
  resetTransactionState,
} from "../redux/slices/transactionSlice";

export const useTransaction = () => {
  const dispatch = useDispatch();
  const { transactionItems, loading, error, success, currentTransaction } =
    useSelector((state) => state.transactions);

  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false); // Add viewing state
  const [isPdfExport, setIsPdfExport] = useState(false); // Add viewing state
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    // Adjust form fields based on transaction data structure
    transaction_type: "",
    product_id: "",
    quantity: "",
    amount: "",
    money_type: "",
    supplier_id: "",
    notes: "",
  });

  const hasReset = useRef(false);

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

  // Reset form and dialog state when closed
  useEffect(() => {
    if (!openDialog) {
      setFormData({
        transaction_type: "",
        product_id: "",
        quantity: "",
        amount: "",
        money_type: "",
        supplier_id: "",
        notes: "",
      });
      setIsDeleting(false);
      setIsEditing(false);
      dispatch(clearCurrentTransaction());
    }
  }, [openDialog, dispatch]);

  // Update formData when editing/deleting a transaction
  useEffect(() => {
    if (currentTransaction) {
      setFormData({
        transaction_type: currentTransaction.transaction_type,
        product_id: currentTransaction.product_id,
        supplier_id: currentTransaction.supplier_id,
        amount: currentTransaction.amount,
        quantity: currentTransaction.quantity,
        money_type: currentTransaction.money_type,
        notes: currentTransaction.notes || "",
      });
      // Ensure state are consistent
      if (isEditing) {
        setIsDeleting(false);
      } else if (isDeleting) {
        setIsEditing(false);
      }
    }
  }, [currentTransaction, isEditing, isDeleting]);

  // Reset entire transaction state when component unmounts
  useEffect(() => {
    return () => {
      if (!hasReset.current) {
        hasReset.current = true;
        dispatch(resetTransactionState());
      }
    };
  }, [dispatch]);

  // fetch transactioin by id
  const fetchTransactionById = (transactionId) => {
    dispatch(fetchTransaction(transactionId));
  };

  // function buttons - ADD THESE LIKE SUPPLIER HOOK
  const handleEditClick = (transaction) => {
    dispatch(setCurrentTransaction(transaction));
    setIsEditing(true);
    setIsDeleting(false);
    setOpenDialog(true);
    console.log("Handle Edit Click: Dialog opened for editing", { isEditing });
  };

  const handleDeleteClick = (transaction) => {
    dispatch(setCurrentTransaction(transaction));
    setIsDeleting(true);
    setIsEditing(false);
    setOpenDialog(true);
    console.log("Handle Delete Click: Dialog opened for deletion", {
      isDeleting,
    });
  };

  // Add view click handler
  const handleViewClick = (transaction) => {
    dispatch(setCurrentTransaction(transaction));
    setIsViewing(true);
    setIsEditing(false);
    setIsDeleting(false);
    setOpenDialog(true);
  };
  
  // In your useTransaction hook
  const handleViewPDF = (transaction) => {
    // Optional: You can keep this if you want, or remove it
    console.log("Navigating to PDF page for:", transaction.id);

    // Store data and navigate
    localStorage.setItem("pdfTransactionData", JSON.stringify(transaction));
    navigate(`/transactions/${transaction.id}/pdf`);
  };

  const handleCloseDetail = () => {
    setOpenDialog(false);
    setIsViewing(false);
    dispatch(clearCurrentTransaction());
  };

  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  return {
    // State
    transactionItems,
    loading,
    error,
    success,
    currentTransaction,
    openDialog,
    isEditing,
    isDeleting,
    isViewing, // Add viewing state
    isPdfExport, // Add viewing state
    formData,
    // Setters
    setFormData,
    setOpenDialog,
    setIsViewing,
    setIsEditing,
    setIsPdfExport,

    // Actions
    handleEditClick, // ADDED
    handleDeleteClick, // ADDED
    handleViewPDF,
    handleViewClick, // Add view action
    handleCloseDetail, // Add close detail action
    handleCloseSnackbar,
    fetchTransactionById, // ✅ Now this will work
  };
};
