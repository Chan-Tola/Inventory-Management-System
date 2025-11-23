import api from "../api";
export const authService = {
  // note: ✅ Login
  login: async (credentials) => {
    try {
      const res = await api.post("/auth/login", credentials);
      return res.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  // note: ✅ Logout
  logout: async (token) => {
    try {
      console.log(
        "🔄 Attempting logout with token:",
        token ? "Token exists" : "No token"
      );

      const res = await api.post(
        "auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // "Content-Type": "application/json",
          },
        }
      );
      console.log("✅ AUTH SERVICE - Logout successful:", res.data);
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || "Logout failed";
    }
  },
};
