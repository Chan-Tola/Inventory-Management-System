import api from "../api";
export const topSellProductService = {
  getTopSellingProducts: async () => {
    try {
      const res = await api.get("top-selling");
      console.log("Top sell response:", res.data); // Check what's in response
      return res.data; // FIX: Change from res.data.data to res.data
    } catch (error) {
      throw error;
    }
  },
};
