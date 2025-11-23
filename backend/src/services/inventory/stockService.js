import api from "../api";
export const stockService = {
  // note: get all stocks
  getStocks: async () => {
    try {
      const res = await api.get("/inventory/stocks");
      console.log(res.data.data);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
  // note: create product
  createStock: async (stockData) => {
    try {
      const res = await api.post("/inventory/stocks", stockData);
      console.log(res.data.data);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
  // note: update product
  updateStock: async (id, stockData) => {
    try {
      const res = await api.put(`/inventory/stocks/${id}`, stockData);
      console.log(res.data.data);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
};
