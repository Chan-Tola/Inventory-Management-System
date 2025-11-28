import { useMemo } from "react";

export const useMonthlyStats = (transactionItems) => {
  return useMemo(() => {
    // Group transactions by month
    const monthlyData = {};

    transactionItems.forEach((transaction) => {
      const date = new Date(transaction.transaction_date);
      const month = date.toLocaleString("default", { month: "short" }); // "Jan", "Feb", etc.

      if (!monthlyData[month]) {
        monthlyData[month] = { month, income: 0, expenses: 0 };
      }

      if (transaction.money_type === "income" && transaction.amount) {
        monthlyData[month].income += parseFloat(transaction.amount) || 0;
      } else if (transaction.money_type === "expense" && transaction.amount) {
        monthlyData[month].expenses += parseFloat(transaction.amount) || 0;
      }
    });

    // Convert to array and ensure all months are present
    const allMonths = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return allMonths.map((month) => {
      return monthlyData[month] || { month, income: 0, expenses: 0 };
    });
  }, [transactionItems]);
};
