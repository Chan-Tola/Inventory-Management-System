import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { orderService } from "../../services/order/orderService";

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const data = await orderService.getOrders();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
export const fetchOrder = createAsyncThunk(
  "orders/fetchOrder",
  async (id, { rejectWithValue }) => {
    try {
      const data = await orderService.getOrderById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Initial State
const initialState = {
  orderItems: [],
  loading: false,
  error: null,
  success: false,
  currentOrder: null,
};

// Ordre Slice
const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    resetOrderState: (state) => {
      state.orderItems = [];
      state.loading = false;
      state.error = null;
      state.success = false;
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orderItems = action.payload;
        state.success = true;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      //   fetch order by id
      .addCase(fetchOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.success = true;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
        state.currentOrder = null;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setCurrentOrder,
  clearCurrentOrder,
  resetOrderState,
} = orderSlice.actions;
export default orderSlice.reducer;
