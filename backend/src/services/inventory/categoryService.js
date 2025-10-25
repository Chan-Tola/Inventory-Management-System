import api from "../api";
export const categoryService = {
  // note: get all categories
  getCategories: async () => {
    try {
      const res = await api.get("/inventory/categories");
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
  // note: get by id
  getCategoryById: async (id) => {
    try {
      const res = await api.get(`/inventory/categories/${id}`);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
  // note: create product
  createCategory: async (categoryData) => {
    try {
      const res = await api.post("/inventory/categories", categoryData);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
  // note: update category
  updateCategory: async (id, categoryData) => {
    try {
      const res = await api.put(`/inventory/categories/${id}`, categoryData);
      console.log(res.data);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
  // note: delete category
  deleteCategory: async (id) => {
    try {
      const res = await api.delete(`/inventory/categories/${id}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};
