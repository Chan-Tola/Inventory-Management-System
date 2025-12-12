import axios from "axios";
const API_BASE_URL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  // headers: {
  //   // "Content-Type": "application/json", // note: Tell Servr we're sending JSON data
  //   // Accept: "application/json", // note:  Tell Server we want JSON responses
  // },
});
// Request interceptor - FIXED
// Add request interceptor to include token automatically
// note: An interceptor is like a middleman or checkpoint that stops and checks data going between two places.
api.interceptors.request.use(
  (config) => {
    // Use console.log instead of config.log
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Only set JSON header if not FormData
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    // console.log(
    //   `Making ${config.method?.toUpperCase()} request to: ${config.url}`
    // );
    // console.log("API Request:", {
    //   url: config.url,
    //   headers: config.headers,
    //   token: token ? "Token exists" : "No token",
    // });
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - FIXED
api.interceptors.response.use(
  (response) => {
    console.log("Response received:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log("❌ Token expired or invalid");
      localStorage.removeItem("token");
    }
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors;
      const errorMessage = Object.values(validationErrors).flat().join(", ");
      return Promise.reject(new Error(errorMessage));
    }

    if (error.response?.status === 500) {
      return Promise.reject(new Error("Server error. Please try again later."));
    }

    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default api;
