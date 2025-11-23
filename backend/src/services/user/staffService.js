import api from "../api";

export const stafffService = {
  getStaffs: async () => {
    try {
      const res = await api.get("/users/staffs");
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
  getStaffById: async (id) => {
    try {
      const res = await api.get(`/users/staffs/${id}`);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
  createStaff: async (StaffData) => {
    try {
      const res = await api.post("/users/staffs", StaffData);
      return res.data.data;
    } catch (error) {
      throw error;
    }
  },
  // note: update product
  updateStaff: async (id, StaffData) => {
    try {
      let res;

      // Check if we have image files to upload
      const hasImageFiles =
        StaffData.profile_url &&
        StaffData.profile_url.some((img) => img instanceof File);

      if (hasImageFiles) {
        // Use FormData for file upload
        const formData = new FormData();

        // Append all fields
        formData.append("name", StaffData.name);
        formData.append("sku", StaffData.sku);
        formData.append("price", StaffData.price);
        formData.append("brand", StaffData.brand);
        formData.append("category_id", StaffData.category_id);
        formData.append("description", StaffData.description || "");

        // Append images - only the new files
        productData.images.forEach((image, index) => {
          if (image instanceof File) {
            formData.append(`images[${index}]`, image);
          }
        });

        // For Laravel, you might need this:
        formData.append("_method", "PUT");

        res = await api.post(`/users/staffs/${id}`, formData);
      } else {
        // Regular JSON update (no new images)
        res = await api.put(`/users/staffs/${id}`, StaffData);
      }

      console.log(res.data);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  //   note: delete product
  deleteStaff: async (id) => {
    try {
      const res = await api.delete(`/users/staffs/${id}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};
