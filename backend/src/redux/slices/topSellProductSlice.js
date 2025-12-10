import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { topSellProductService } from "../../services/TopSaleProduct/topSellProductService";

export const fetchTopSellingProducts = createAsyncThunk(
  "topSellProducts/fetchTopSellingProducts",
  async (_, { rejectWithValue }) => {
    try {
      const data = await topSellProductService.getTopSellingProducts();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  topSellProducts: [], // This will store the products array
  totalCount: 0,
  totalSales: 0,
  totalQuantity: 0,
  loading: false,
  error: null,
  success: false,
};

const topSellProductSlice = createSlice({
  name: "topSellProducts",
  initialState,
  reducers: {
    // Clear error state
    clearError: (state) => {
      state.error = null;
    },
    // Clear success state
    clearSuccess: (state) => {
      state.success = false;
    },
    // Reset state
    resetTopSell: (state) => {
      state.topSellProducts = [];
      state.totalCount = 0;
      state.totalSales = 0;
      state.totalQuantity = 0;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle pending state
      .addCase(fetchTopSellingProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      // Handle fulfilled state
      .addCase(fetchTopSellingProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.topSellProducts = action.payload.products || [];
        state.totalCount = action.payload.total_count || 0;
        state.totalSales = action.payload.total_sales || 0;
        state.totalQuantity = action.payload.total_quantity || 0;
      })
      // Handle rejected state
      .addCase(fetchTopSellingProducts.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch top selling products";
      });
  },
});

export const { clearError, clearSuccess, resetTopSell } =
  topSellProductSlice.actions;

export default topSellProductSlice.reducer;
