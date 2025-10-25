import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productService } from "../../services/inventory/productService";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const data = await productService.getProducts();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const data = await productService.createProduct(productData);
      return data;
    } catch (error) {
      throw rejectWithValue(error.message);
    }
  }
);
export const updateProduct = createAsyncThunk(
  "products/updateCategory",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const data = await productService.updateProduct(id, productData);
      console.log(data);
      return data;
    } catch (error) {
      throw rejectWithValue(error.message);
    }
  }
);
export const deleteProduct = createAsyncThunk(
  "products/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(id);
      return id;
    } catch (error) {
      throw rejectWithValue(error.message);
    }
  }
);
// Initial state
const initialState = {
  productItems: [],
  loading: false,
  error: null,
  success: false,
  currentProduct: null,
};

// productService slice
const productSlice = createSlice({
  name: "products",
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
    // Set current product for editing
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
    // Clear current product
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    // Reset entire state
    resetProductState: (state) => {
      state.productItems = [];
      state.loading = false;
      state.error = null;
      state.success = false;
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.productItems = action.payload;
        state.success = true;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Create Category
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.productItems.push(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update Category
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;

        // Debug: see what's in the payload
        console.log("Update fulfilled payload:", action.payload);

        const index = state.productItems.findIndex(
          (item) => item.id === action.payload.id
        );

        console.log("Found index:", index);

        if (index !== -1) {
          state.productItems[index] = action.payload;
        }
        state.success = true;
        state.currentProduct = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // delete
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.productItems = state.productItems.filter(
          (item) => item.id !== action.payload
        );
        state.success = true;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setCurrentProduct,
  clearCurrentProduct,
  resetProductState,
} = productSlice.actions;
export default productSlice.reducer;
