import { Route, Routes } from "react-router";
// note: layouts
import { MasterLayout } from "../components/layouts/index";
// note: pages
import {
  Dashboard,
  CategoryPage,
  ProductPage,
  StockPage,
  Setting,
  LoginPage,
  StaffPage,
  CustomerPage,
} from "../pages/index";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import { routes } from "./routes";
import UnauthorizedPage from "../pages/UnauthorizedPage";

const AppRoute = () => {
  return (
    <>
      <Routes>
        {/* Public routes (Auth pages) */}
        <Route
          path="session/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        {/* Unauthorized page */}
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        {/* Protected App Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MasterLayout />
            </PrivateRoute>
          }
        >
          {/* Dynamic routes based on configuration */}
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path === "/" ? "" : route.path.replace("/", "")}
              element={
                <PrivateRoute requiredPermission={route.permission}>
                  {route.element}
                </PrivateRoute>
              }
            />
          ))}
        </Route>
        {/* Protected App Routes */}
        {/* <Route
          path="/"
          element={
            <PrivateRoute>
              <MasterLayout />
            </PrivateRoute>
          }
        > */}
        {/* <Route index element={<Dashboard />} />
       {/* ims-inventory route */}
        {/* <Route path="categories" element={<CategoryPage />} /> */}
        {/* <Route path="products" element={<ProductPage />} /> */}
        {/* <Route path="stocks" element={<StockPage />} /> */}
        {/* <Route path="suppliers" element={<StockPage />} /> */}
        {/* <Route path="transitions" element={<StockPage />} /> */}
        {/* ims-user route */}
        {/* <Route path="staffs" element={<StaffPage />} /> */}
        {/* <Route path="customers" element={<StockPage />} /> */}
        {/* ims-order route */}
        {/* <Route path="setting" element={<Setting />} /> */}
        {/* </Route> */}
      </Routes>
    </>
  );
};

export default AppRoute;
