import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supplierService } from "../../services/inventory/supplierService";

export const fetchSuppliers = createAsyncThunk(
  "suppliers/fetchSuppliers",
  async (_, { rejectWithValue }) => {
    try {
      const data = await supplierService.getSuppliers();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createSupplier = createAsyncThunk(
  "suppliers/createSupplier",
  async (supplierData, { rejectWithValue }) => {
    try {
      const data = await supplierService.createSupplier(supplierData);
      return data;
    } catch (error) {
      throw rejectWithValue(error.message);
    }
  }
);
export const updateSupplier = createAsyncThunk(
  "suppliers/updateSupplier",
  async ({ id, supplierData }, { rejectWithValue }) => {
    try {
      const data = await supplierService.updateSupplier(id, supplierData);
      console.log(data);
      return data;
    } catch (error) {
      throw rejectWithValue(error.message);
    }
  }
);
export const deleteSupplier = createAsyncThunk(
  "suppliers/deleteSupplier",
  async (id, { rejectWithValue }) => {
    try {
      await supplierService.deleteSupplier(id);
      return id;
    } catch (error) {
      throw rejectWithValue(error.message);
    }
  }
);
// Initial state
const initialState = {
  supplierItems: [],
  loading: false,
  error: null,
  success: false,
  currentSupplier: null,
};

// Category slice
const supplierSlice = createSlice({
  name: "suppliers",
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
    // Set current category for editing
    setCurrentSupplier: (state, action) => {
      state.currentSupplier = action.payload;
    },
    // Clear current category
    clearCurrentSupplier: (state) => {
      state.currentSupplier = null;
    },
    // Reset entire state
    resetSupplierState: (state) => {
      state.supplierItems = [];
      state.loading = false;
      state.error = null;
      state.success = false;
      state.currentSupplier = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.supplierItems = action.payload;
        state.success = true;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Create Category
      .addCase(createSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.supplierItems.push(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update Category
      .addCase(updateSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.supplierItems.findIndex(
          (item) => item.id === action.payload.id
        );

        if (index !== -1) {
          state.supplierItems[index] = action.payload;
        }
        state.success = true;
        state.currentSupplier = null;
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // delete
      .addCase(deleteSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.loading = true;
        state.supplierItems = state.supplierItems.filter(
          (item) => item.id !== action.payload
        );
        state.success = true;
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setCurrentSupplier,
  clearCurrentSupplier,
  resetSupplierState,
} = supplierSlice.actions;
export default supplierSlice.reducer; // Make sure this export exists
