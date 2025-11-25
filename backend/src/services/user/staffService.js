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
      // Just send all data as JSON, including the base64 image string
      const res = await api.put(`/users/staffs/${id}`, StaffData);
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
