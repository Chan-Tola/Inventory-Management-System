import api from "../api";

export const customerService = {
  getCustomers: async () => {
    try {
      const res = await api.get("/users/customers");
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
  getCustomerById: async (id) => {
    try {
      const res = await api.get(`/users/customers/${id}`);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
  createCustomer: async (customerData) => {
    try {
      const res = await api.post("/users/customers", customerData);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
  // note: update product
  updateCustomer: async (id, customerData) => {
    try {
      // Just send all data as JSON, including the base64 image string
      const res = await api.put(`/users/customers/${id}`, customerData);
      console.log(res.data);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  //   note: delete product
  deleteCustomer: async (id) => {
    try {
      const res = await api.delete(`/users/customers/${id}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};
