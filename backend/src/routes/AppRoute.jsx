import { Route, Routes } from "react-router";
// note: layouts
import { MasterLayout } from "../components/layouts/index";
import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import { routes } from "./routes";
import { LoginPage } from "../pages";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import { TransactionPDFExport } from "../components/features/transaction";
import OrderPDFExport from "../components/features/order/OrderPDFExport";

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
        {/* PDF Export Page - SEPARATE route with no layout */}
        <Route
          path="/transactions/:transactionId/pdf"
          element={
            <PrivateRoute>
              <TransactionPDFExport />
            </PrivateRoute>
          }
        />
        {/* PDF Export Page - SEPARATE route with no layout */}
        <Route
          path="/orders/:orderId/pdf"
          element={
            <PrivateRoute>
              <OrderPDFExport />
            </PrivateRoute>
          }
        />
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
      </Routes>
    </>
  );
};

export default AppRoute;
