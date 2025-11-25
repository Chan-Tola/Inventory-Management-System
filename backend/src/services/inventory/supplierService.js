import api from "../api";
export const supplierService = {
  // note: get all categories
  getSuppliers: async () => {
    try {
      const res = await api.get("/inventory/suppliers");
      console.log(res);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
  // note: get by id
  getSupplierById: async (id) => {
    try {
      const res = await api.get(`/inventory/suppliers/${id}`);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
  // note: create product
  createSupplier: async (supplierData) => {
    try {
      const res = await api.post("/inventory/suppliers", supplierData);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
  // note: update category
  updateSupplier: async (id, supplierData) => {
    try {
      const res = await api.put(`/inventory/suppliers/${id}`, supplierData);
      console.log(res.data);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
  // note: delete category
  deleteSupplier: async (id) => {
    try {
      const res = await api.delete(`/inventory/suppliers/${id}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};
