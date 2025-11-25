import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import categoryReducer from "./slices/categorySlice";
import productReducer from "./slices/productSlice";
import stockReducer from "./slices/stockSlice";
import staffReducer from "./slices/staffSlice";
import supplierReducer from "./slices/supplierSlice";
import customerReducer from "./slices/customerSlice";
const store = configureStore({
  reducer: {
    // Add other reducers here for microservices
    // note: auth
    auth: authReducer,
    // note: inventory management
    categories: categoryReducer,
    products: productReducer,
    stocks: stockReducer,
    suppliers: supplierReducer,
    // note: user management
    staffs: staffReducer,
    customers: customerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export default store;
