import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json", // note: Tell Servr we're sending JSON data
    Accept: "application/json", // note:  Tell Server we want JSON responses
  },
});

// Request interceptor - FIXED
// note: An interceptor is like a middleman or checkpoint that stops and checks data going between two places.
api.interceptors.request.use(
  (config) => {
    // Use console.log instead of config.log
    console.log(
      `Making ${config.method?.toUpperCase()} request to: ${config.url}`
    );
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
