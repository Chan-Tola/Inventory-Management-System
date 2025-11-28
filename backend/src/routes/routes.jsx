import {
  Dashboard,
  CategoryPage,
  ProductPage,
  StockPage,
  SupplierPage,
  Setting,
  StaffPage,
  CustomerPage,
  TranscationPage,
  OrderPage,
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
    path: "/suppliers",
    element: <SupplierPage />,
    permission: "view supplier",
    menu: {
      title: "Suppliers",
      icon: "warehouse",
      showInMenu: true,
    },
  },
  {
    path: "/transactions",
    element: <TranscationPage />,
    permission: "view transaction",
    menu: {
      title: "Transactions",
      icon: "warehouse",
      showInMenu: true,
    },
  },
  // IMS-Order
  {
    path: "/orders",
    element: <OrderPage />,
    permission: "view order",
    menu: {
      title: "Orders",
      icon: "warehouse",
      showInMenu: true,
    },
  },
  // IMS-User
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
    path: "/customers",
    element: <CustomerPage />,
    permission: "view customer",
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
