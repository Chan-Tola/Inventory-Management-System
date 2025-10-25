import api from "../api";
export const productService = {
  // note: get all products
  getProducts: async () => {
    try {
      const res = await api.get("/inventory/products");
      return res.data.data; // This should be your products array
    } catch (error) {
      throw error;
    }
  },
  // note: get product by id
  getProductById: async (id) => {
    try {
      const res = await api.get(`/inventory/products/${id}`);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
  // note: create product
  createProduct: async (ProductData) => {
    try {
      const res = await api.post("/inventory/products", ProductData);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
  // note: update product
  updateProduct: async (id, ProductData) => {
    try {
      const res = await api.put(`/inventory/products/${id}`, ProductData);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
  //   note: delete product
  deleteProduct: async (id) => {
    try {
      const res = await api.delete(`/inventory/products/${id}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};
