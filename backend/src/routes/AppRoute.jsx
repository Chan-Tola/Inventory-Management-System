import { Route, Routes } from "react-router";
// note: layouts
import { MasterLayout } from "../components/layouts/index";
// note: pages
import { Dashboard, CategoryPage, ProductPage } from "../pages/index";

const AppRoute = () => {
  return (
    <>
      <Routes>
        {/* Main app layout */}
        <Route path="/" element={<MasterLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="categories" element={<CategoryPage />} />
          <Route path="products" element={<ProductPage />} />
        </Route>
      </Routes>
    </>
  );
};

export default AppRoute;
