import api from "../api";

export const transcationService = {
  // note: get all transactions
  getTransactions: async () => {
    try {
      const res = await api.get("/inventory/transactions");
      console.log(res); // Same logging pattern as supplier service
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },

  // note: get transaction by id
  getTransactionById: async (id) => {
    try {
      const res = await api.get(`/inventory/transactions/${id}`);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },

  // note: create transaction
  createTransaction: async (transactionData) => {
    try {
      const res = await api.post("/inventory/transactions", transactionData);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },

  // note: update transaction
  updateTransaction: async (id, transactionData) => {
    try {
      const res = await api.put(
        `/inventory/transactions/${id}`,
        transactionData
      );
      console.log(res.data);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },

  // note: delete transaction
  deleteTransaction: async (id) => {
    try {
      const res = await api.delete(`/inventory/transactions/${id}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};
