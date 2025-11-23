import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import categoryReducer from "./slices/categorySlice";
import productReducer from "./slices/productSlice";
import stockReducer from "./slices/stockSlice";
import staffReducer from "./slices/staffSlice";

const store = configureStore({
  reducer: {
    // Add other reducers here for microservices
    // note: auth
    auth: authReducer,
    // note: inventory management
    categories: categoryReducer,
    products: productReducer,
    stocks: stockReducer,
    // note: user management
    staffs: staffReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export default store;
