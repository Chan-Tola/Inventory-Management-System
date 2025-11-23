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
export const routes = [
  {
    path: "/",
    element: <Dashboard />,
    permission: null, // No specific permission required, just authentication
    menu: {
      title: "Dashboard",
      icon: "dashboard",
      showInMenu: true,
    },
  },
  {
    path: "/categories",
    element: <CategoryPage />,
    permission: "view category",
    menu: {
      title: "Categories",
      icon: "category",
      showInMenu: true,
    },
  },
  {
    path: "/products",
    element: <ProductPage />,
    permission: "view product",
    menu: {
      title: "Products",
      icon: "inventory",
      showInMenu: true,
    },
  },
  {
    path: "/stocks",
    element: <StockPage />,
    permission: "view stock",
    menu: {
      title: "Stocks",
      icon: "warehouse",
      showInMenu: true,
    },
  },
  {
    path: "/staffs",
    element: <StaffPage />,
    permission: "view staff",
    menu: {
      title: "Staff",
      icon: "people",
      showInMenu: true,
    },
  },
  {
    path: "/setting",
    element: <Setting />,
    permission: null, // All authenticated users can access settings
    menu: {
      title: "Settings",
      icon: "settings",
      showInMenu: true,
    },
  },
];
