import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "./slices/categorySlice";
import productReducer from "./slices/productSlice";
const store = configureStore({
  reducer: {
    categories: categoryReducer,
    products: productReducer, // ✅ should be here
    // products: productReducer,
    // Add other reducers here for microservices
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export default store;
