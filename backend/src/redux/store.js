import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import categoryReducer from "./slices/categorySlice";
import productReducer from "./slices/productSlice";
import stockReducer from "./slices/stockSlice";
import staffReducer from "./slices/staffSlice";
import supplierReducer from "./slices/supplierSlice";
import customerReducer from "./slices/customerSlice";
import transactionReducer from "./slices/transactionSlice";
import orderReducer from "./slices/orderSlice";
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
    transactions: transactionReducer,
    // note: user management
    staffs: staffReducer,
    customers: customerReducer,
    orders: orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export default store;
