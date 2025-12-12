import { useMemo } from "react";

export const useFinancialStats = (transactionItems) => {
  return useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactionItems.forEach((transaction) => {
      const amount = parseFloat(transaction.amount) || 0;
      const quantity = parseFloat(transaction.quantity) || 1; // default 1

      const total = amount * quantity;

      if (transaction.money_type === "income") {
        totalIncome += total;
      }

      if (transaction.money_type === "expense") {
        totalExpenses += total;
      }
    });

    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
    };
  }, [transactionItems]);
};
