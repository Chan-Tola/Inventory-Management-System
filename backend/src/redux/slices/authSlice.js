import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/auth/authService";
// note:  Get initial state from localStorage
const getInitialState = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const staff = localStorage.getItem("staff");

  return {
    user: user ? JSON.parse(user) : null,
    token: token,
    loading: false,
    error: null,
    // isAuthenticated: false,
    isAuthenticated: !!token,
  };
};
// note: Login thunk
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await authService.login(credentials);
      // Save token to localStorage
      // console.log(res.access_token);
      if (res.access_token) {
        localStorage.setItem("token", res.access_token);
        localStorage.setItem("user", JSON.stringify(res.user));
        localStorage.setItem("staff", JSON.stringify(res.user.staff));
      }

      // localStorage.setItem("token", res.token);
      return res;
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

// note: Logout thunk
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      console.log("🔑 Token for logout:", token);

      if (!token) {
        console.warn("⚠️ No token found in state");
        return rejectWithValue("No authentication token found");
      }

      console.log("🔄 Calling authService.logout...");
      const res = await authService.logout(token);
      console.log("✅ Logout service response:", res);

      return res;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    clearAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.staff = null;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
      // note: Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("staff");
    },
    setCredentials: (state, action) => {
      const { user, token, staff } = action.payload;
      state.user = user;
      state.token = token;
      state.staff = staff;
      state.isAuthenticated = true;
      state.error = null;
      // note:Save to localStorage
      localStorage.setItem("token");
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("staff", JSON.stringify(staff));
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      //  ✅ Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.staff = action.payload.staff;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // ✅ Logout case
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.staff = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        // note: Clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.staff = null;
        state.token = null;
        state.isAuthenticated = false;
        // note: Clear localStorage even if API call fails
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      });
  },
});

export const { clearAuthState, setCredentials, clearError } = authSlice.actions;
export default authSlice.reducer;
