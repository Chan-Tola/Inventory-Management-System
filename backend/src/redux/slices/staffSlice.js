import { createAsyncThunk, createSlice, current } from "@reduxjs/toolkit";
import { stafffService } from "../../services/user/staffService";

// index
export const fetchStaffs = createAsyncThunk(
  "staffs/fetchStaffs",
  async (_, { rejectWithValue }) => {
    try {
      const data = await stafffService.getStaffs();
      return data;
    } catch (error) {
      return rejectWithValue(error.messsage);
    }
  }
);
// show
export const fetchStaff = createAsyncThunk(
  "staffs/fetchStaff",
  async ($id, { rejectWithValue }) => {
    try {
      const data = await stafffService.getStaffById($id);
      return data;
    } catch (error) {
      return rejectWithValue(error.messsage);
    }
  }
);
// store
export const createStaff = createAsyncThunk(
  "staffs/createStaff",
  async (StaffData, { rejectWithValue }) => {
    try {
      const data = await stafffService.createStaff(StaffData);
      return data;
    } catch (error) {
      return rejectWithValue(error.messsage);
    }
  }
);
// update
export const updateStaff = createAsyncThunk(
  "staffs/updateStaff",
  async ({ id, StaffData }, { rejectWithValue }) => {
    try {
      const data = await stafffService.updateStaff(id, StaffData);
      return data;
    } catch (error) {
      throw rejectWithValue(error.message || "Update failed");
    }
  }
);
// delete
export const deleteStaff = createAsyncThunk(
  "staffs/deleteStaff",
  async (id, { rejectWithValue }) => {
    try {
      const data = await stafffService.deleteStaff(id);
      return data;
    } catch (error) {
      throw rejectWithValue(error.message || "Update failed");
    }
  }
);

// Initial state
const initialState = {
  staffItems: [],
  loading: false,
  error: null,
  success: false,
  currentStaff: null,
};

// staffSlice state
const staffSlice = createSlice({
  name: "staffs",
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
    // Set current staff for editing
    setCurrentStaff: (state, action) => {
      state.currentStaff = action.payload;
    },
    // Clear current staff
    clearCurrentStaff: (state) => {
      state.currentStaff = null;
    },
    // Reset staff state
    resetStaffState: (state) => {
      state.staffItems = [];
      state.loading = false;
      state.error = null;
      state.success = false;
      state.currentStaff = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch staffs
      .addCase(fetchStaffs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffs.fulfilled, (state, action) => {
        state.loading = false;
        state.staffItems = action.payload;
        state.success = true;
      })
      .addCase(fetchStaffs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // create staff
      .addCase(createStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.staffItems.push(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // update staff
      .addCase(updateStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        state.loading = false;
        // Debug: see what's in the payload
        console.log("Update fulfilled payload:", action.payload);

        const index = state.staffItems.findIndex(
          (item) => item.id === action.payload.id
        );

        console.log("Found index:", index);

        if (index !== -1) {
          state.staffItems[index] = action.payload;
        }
        state.success = true;
        state.currentProduct = null;
      })
      .addCase(updateStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      //  delete staff
      .addCase(deleteStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.productItems = state.staffItems.filter(
          (item) => item.id !== action.payload
        );
        state.success = true;
      })
      .addCase(deleteStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setCurrentStaff,
  clearCurrentStaff,
  resetStaffState,
} = staffSlice.actions;
export default staffSlice.reducer;
