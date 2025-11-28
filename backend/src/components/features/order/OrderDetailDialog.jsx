import React from "react";

const OrderDetailDialog = () => {
  // Format date for display
  const formatAmount = (amount) => {
    if (!amount) return "-";
    return `$${parseFloat(amount).toFixed(2)}`;
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  return <div>OrderDetailDialog</div>;
};

export default OrderDetailDialog;
