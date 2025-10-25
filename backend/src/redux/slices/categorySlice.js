import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { categoryService } from "../../services/inventory/categoryService";

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const data = await categoryService.getCategories();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const data = await categoryService.createCategory(categoryData);
      return data;
    } catch (error) {
      throw rejectWithValue(error.message);
    }
  }
);
export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const data = await categoryService.updateCategory(id, categoryData);
      console.log(data);
      return data;
    } catch (error) {
      throw rejectWithValue(error.message);
    }
  }
);
export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(id);
      return id;
    } catch (error) {
      throw rejectWithValue(error.message);
    }
  }
);
// Initial state
const initialState = {
  categoryItems: [],
  loading: false,
  error: null,
  success: false,
  currentCategory: null,
};

// Category slice
const categorySlice = createSlice({
  name: "categories",
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
    setCurrentCategory: (state, action) => {
      state.currentCategory = action.payload;
    },
    // Clear current category
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
    // Reset entire state
    resetCategoryState: (state) => {
      state.categoryItems = [];
      state.loading = false;
      state.error = null;
      state.success = false;
      state.currentCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryItems = action.payload;
        state.success = true;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryItems.push(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;

        // Debug: see what's in the payload
        console.log("Update fulfilled payload:", action.payload);

        const index = state.categoryItems.findIndex(
          (item) => item.id === action.payload.id
        );

        console.log("Found index:", index);

        if (index !== -1) {
          state.categoryItems[index] = action.payload;
        }
        state.success = true;
        state.currentCategory = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // delete
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = true;
        state.categoryItems = state.categoryItems.filter(
          (item) => item.id !== action.payload
        );
        state.success = true;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setCurrentCategory,
  clearCurrentCategory,
  resetCategoryState,
} = categorySlice.actions;
export default categorySlice.reducer; // Make sure this export exists
