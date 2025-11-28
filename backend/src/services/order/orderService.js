import api from "../api";

export const orderService = {
  getOrders: async () => {
    try {
      const res = await api.get("/orders");
      console.log(res);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
  getOrderById: async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
};
