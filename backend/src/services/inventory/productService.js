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
  updateProduct: async (id, productData) => {
    try {
      let res;

      // Check if we have image files to upload
      const hasImageFiles =
        productData.images &&
        productData.images.some((img) => img instanceof File);

      if (hasImageFiles) {
        // Use FormData for file upload
        const formData = new FormData();

        // Append all fields
        formData.append("name", productData.name);
        formData.append("sku", productData.sku);
        formData.append("price", productData.price);
        formData.append("brand", productData.brand);
        formData.append("category_id", productData.category_id);
        formData.append("description", productData.description || "");

        // Append images - only the new files
        productData.images.forEach((image, index) => {
          if (image instanceof File) {
            formData.append(`images[${index}]`, image);
          }
        });

        // For Laravel, you might need this:
        formData.append("_method", "PUT");

        res = await api.post(`/inventory/products/${id}`, formData);
      } else {
        // Regular JSON update (no new images)
        res = await api.put(`/inventory/products/${id}`, productData);
      }

      console.log(res.data);
      return res.data;
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
