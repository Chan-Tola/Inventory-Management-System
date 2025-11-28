import { useMemo } from "react";

export const useFinancialStats = (transactionItems) => {
  return useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactionItems.forEach((transaction) => {
      if (transaction.money_type === "income" && transaction.amount) {
        totalIncome += parseFloat(transaction.amount) || 0;
      } else if (transaction.money_type === "expense" && transaction.amount) {
        totalExpenses += parseFloat(transaction.amount) || 0;
      }
    });

    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
    };
  }, [transactionItems]);
};
