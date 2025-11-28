import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { transcationService } from "../../services/inventory/transcationService";

export const fetchTransactions = createAsyncThunk(
  "transactions/fetchTransactions",
  async (_, { rejectWithValue }) => {
    try {
      const data = await transcationService.getTransactions();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchTransaction = createAsyncThunk(
  "transactions/fetchTransaction",
  async (id, { rejectWithValue }) => {
    try {
      const data = await transcationService.getTransactionById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createTransaction = createAsyncThunk(
  "transactions/createTransaction",
  async (transactionData, { rejectWithValue }) => {
    try {
      const data = await transcationService.createTransaction(transactionData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// export const updateTransaction = createAsyncThunk(
//   "transactions/updateTransaction",
//   async ({ id, transactionData }, { rejectWithValue }) => {
//     try {
//       const data = await transcationService.updateTransaction(
//         id,
//         transactionData
//       );
//       return data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

export const deleteTransaction = createAsyncThunk(
  "transactions/deleteTransaction",
  async (id, { rejectWithValue }) => {
    try {
      await transcationService.deleteTransaction(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Initial state
const initialState = {
  transactionItems: [],
  loading: false,
  error: null,
  success: false,
  currentTransaction: null,
};

// Transaction slice
const transactionSlice = createSlice({
  name: "transactions",
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
    // Set current transaction for editing
    setCurrentTransaction: (state, action) => {
      state.currentTransaction = action.payload;
    },
    // Clear current transaction
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
    },
    // Reset entire state
    resetTransactionState: (state) => {
      state.transactionItems = [];
      state.loading = false;
      state.error = null;
      state.success = false;
      state.currentTransaction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactionItems = action.payload;
        state.success = true;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Get Transaction By ID
      .addCase(fetchTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload;
        state.success = true;
      })
      .addCase(fetchTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
        state.currentTransaction = null;
      })
      // Create Transaction
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactionItems.push(action.payload);
        state.success = true;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update Transaction
      // .addCase(updateTransaction.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(updateTransaction.fulfilled, (state, action) => {
      //   state.loading = false;
      //   const index = state.transactionItems.findIndex(
      //     (item) => item.id === action.payload.id
      //   );
      //   if (index !== -1) {
      //     state.transactionItems[index] = action.payload;
      //   }
      //   state.success = true;
      //   state.currentTransaction = null;
      // })
      // .addCase(updateTransaction.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      //   state.success = false;
      // })

      // Delete Transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactionItems = state.transactionItems.filter(
          (item) => item.id !== action.payload
        );
        state.success = true;
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setCurrentTransaction,
  clearCurrentTransaction,
  resetTransactionState,
} = transactionSlice.actions;

export default transactionSlice.reducer;
