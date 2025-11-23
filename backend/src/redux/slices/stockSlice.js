import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { stockService } from "../../services/inventory/stockService";

export const fetchStocks = createAsyncThunk(
  "stocks/fetchStocks",
  async (_, { rejectWithValue }) => {
    try {
      const data = await stockService.getStocks();
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createStock = createAsyncThunk(
  "stocks/createStock",
  async (stockData, { rejectWithValue }) => {
    try {
      const data = await stockService.createStock(stockData);
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateStock = createAsyncThunk(
  "stocks/updateStock",
  async ({ id, stockData }, { rejectWithValue }) => {
    try {
      const data = await stockService.updateStock(id, stockData);
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Initial state
const initialState = {
  stockItems: [],
  loading: false,
  error: null,
  success: false,
  currentStock: null,
};
// Stock slice
const stockSlice = createSlice({
  name: "stocks",
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
    // Set current stock for editing
    setCurrentStock: (state, action) => {
      state.currentStock = action.payload;
    },
    // Clear current stock
    resetStockState: (state) => {
      state.currentStock = null;
    },
    // Reset entire state
    resetStockState: (state) => {
      state.stockItems = [];
      state.loading = false;
      state.error = null;
      state.success = false;
      state.currentStock = null;
    },
  },
  extraReducers: (builer) => {
    builer
      // Fetch Stocks
      .addCase(fetchStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.stockItems = action.payload;
        state.success = true;
      })
      .addCase(fetchStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Create Stocks
      .addCase(createStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStock.fulfilled, (state, action) => {
        state.loading = false;
        state.stockItems.push(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(createStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update Stocks
      .addCase(updateStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStock.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.stockItems.findIndex(
          (item) => item.id === action.payload.id
        );

        if (index !== -1) {
          state.stockItems[index] = action.payload;
        }
        state.success = true;
        state.error = null;
      })
      .addCase(updateStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setCurrentStock,
  clearCurrentStock,
  resetStockState,
} = stockSlice.actions;
export default stockSlice.reducer; // Make sure this export exists
