import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { customerService } from "../../services/user/customerService";

export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (_, { rejectWithValue }) => {
    try {
      const data = await customerService.getCustomers();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (customerData, { rejectWithValue }) => {
    try {
      const data = await customerService.createCustomer(customerData);
      return data;
    } catch (error) {
      throw rejectWithValue(error.message);
    }
  }
);
export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async ({ id, customerData }, { rejectWithValue }) => {
    try {
      const data = await customerService.updateCustomer(id, customerData);
      console.log(data);
      return data;
    } catch (error) {
      throw rejectWithValue(error.message);
    }
  }
);
export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async (id, { rejectWithValue }) => {
    try {
      await customerService.deleteCustomer(id);
      return id;
    } catch (error) {
      throw rejectWithValue(error.message);
    }
  }
);
// Initial state
const initialState = {
  customerItems: [],
  loading: false,
  error: null,
  success: false,
  currentCustomer: null,
};

// Category slice
const customerSlice = createSlice({
  name: "customers",
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
    setCurrentCustomer: (state, action) => {
      state.currentCustomer = action.payload;
    },
    // Clear current category
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
    // Reset entire state
    resetCustomerState: (state) => {
      state.customerItems = [];
      state.loading = false;
      state.error = null;
      state.success = false;
      state.currentCustomer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customerItems = action.payload;
        state.success = true;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Create Category
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customerItems.push(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update Category
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.customerItems.findIndex(
          (item) => item.id === action.payload.id
        );

        if (index !== -1) {
          state.customerItems[index] = action.payload;
        }
        state.success = true;
        state.currentCustomer = null;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // delete
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = true;
        state.customerItems = state.customerItems.filter(
          (item) => item.id !== action.payload
        );
        state.success = true;
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setCurrentCustomer,
  clearCurrentCustomer,
  resetCustomerState,
} = customerSlice.actions;
export default customerSlice.reducer; // Make sure this export exists
