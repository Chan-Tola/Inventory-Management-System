import { useDispatch } from "react-redux";
import { Box } from "@mui/material";
import { useState } from "react"; // Added useEffect import
import { useTransaction } from "../../hooks/useTransaction";
import {
  TransactionHeader,
  TransactionTable,
  TranscationForm,
  TransactionDetailDialog,
} from "../../components/features/transaction/index";
import { createTransaction } from "../../redux/slices/transactionSlice";
import { Notification } from "../../components/common/index";
import { useProduct } from "../../hooks/useProduct";
import { useSupplier } from "../../hooks/useSupplier";

const TranscationPage = () => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const { productItems } = useProduct();
  const { supplierItems } = useSupplier();

  // ✅ FIXED: Use ALL the hook properties like in your supplier page
  const {
    transactionItems,
    loading,
    error,
    success,
    openDialog,
    currentTransaction,
    isEditing,
    isDeleting,
    isViewing,
    formData,
    setOpenDialog,
    setFormData,
    handleViewClick,
    handleEditClick,
    handleDeleteClick,
    handleRefresh,
    handleCloseSnackbar,
    handleCloseDetail,
  } = useTransaction();

  // ✅ FIXED: Filter transactions based on product name or notes
  const filteredTransactions = transactionItems.filter((item) =>
    item.product?.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  // ✅ FIXED: Function to create transaction
  const handleCreateTransaction = async () => {
    try {
      await dispatch(createTransaction(formData)).unwrap();
      setOpenDialog(false);
      handleRefresh();
    } catch (error) {
      console.log("Failed to create transaction:", error);
    }
  };

  // ✅ FIXED: Function to update transaction (uncomment when ready)
  // const handleUpdateTransaction = async () => {
  //   if (!currentTransaction || !currentTransaction.id) {
  //     console.error("No current transaction selected for update");
  //     console.log(currentTransaction);
  //     alert("No transaction selected for editing");
  //     return;
  //   }

  //   try {
  //     await dispatch(
  //       updateTransaction({
  //         id: currentTransaction.id,
  //         transactionData: formData,
  //       })
  //     ).unwrap();
  //     setOpenDialog(false);
  //     handleRefresh();
  //   } catch (error) {
  //     console.error("Failed to update transaction:", error);
  //   }
  // };

  // ✅ FIXED: Function to delete transaction (uncomment when ready)
  // const handleDeleteTransaction = async () => {
  //   if (currentTransaction) {
  //     try {
  //       await dispatch(deleteTransaction(currentTransaction.id)).unwrap();
  //       setOpenDialog(false);
  //       handleRefresh();
  //     } catch (error) {
  //       console.error("Failed to delete transaction:", error);
  //       alert(`Delete failed: ${error.message}`);
  //     }
  //   }
  // };

  // ✅ FIXED: Determine which submit function to use
  // const handleFormSubmit = isEditing
  //   ? handleUpdateTransaction
  //   : handleCreateTransaction;

  return (
    <>
      <Box p={3}>
        {/* Header */}
        <TransactionHeader
          itemsCount={transactionItems.length}
          searchText={searchText}
          setSearchText={setSearchText}
          loading={loading}
          onAddTransaction={() => setOpenDialog(true)}
        />

        {/* Notification */}
        <Notification
          open={success}
          message="Operation completed successfully!"
          severity="success"
          onClose={handleCloseSnackbar}
          autoHideDuration={3000}
        />

        {/* Error Notification */}
        <Notification
          open={!!error}
          message={error || "An error occurred"}
          severity="error"
          onClose={handleCloseSnackbar}
          autoHideDuration={5000}
        />

        {/* Transactions Table */}
        <TransactionTable
          transactionItems={filteredTransactions}
          loading={loading}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onView={handleViewClick} // ADD THIS
        />
        {/* Conditional Rendering based on mode */}
        {isViewing ? (
          // View Details Dialog
          <TransactionDetailDialog
            open={openDialog}
            onClose={handleCloseDetail}
            transaction={currentTransaction}
            loading={loading}
          />
        ) : (
          // Add/Edit Transaction Form
          <TranscationForm
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            isEditing={isEditing}
            isDeleting={isDeleting}
            formData={formData}
            loading={loading}
            onSubmit={handleCreateTransaction}
            onFormDataChange={setFormData}
            currentTransaction={currentTransaction}
            products={productItems}
            suppliers={supplierItems}
          />
        )}
      </Box>
    </>
  );
};

export default TranscationPage;
