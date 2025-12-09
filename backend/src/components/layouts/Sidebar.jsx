import { useState } from "react";
import { Link } from "react-router-dom";

// Material-UI Components
import { Box, Typography, useTheme } from "@mui/material";

// Pro Sidebar Components
import { ProSidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";

// Assets & Icons
import { tokens } from "../../theme";
import darkModeLogo from "../../assets/images/logo-dark-mode.png";
import lightModeLogo from "../../assets/images/logo-light-mode.png";

// Material-UI Icons
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";

// Hooks
import { useAuth } from "../../hooks/useAuth";

// note: REUSABLE COMPONENTS
const Item = ({
  title,
  to,
  icon,
  selected,
  setSelected,
  requiredPermission,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { hasPermission } = useAuth();

  // Check if user has permission to see this item
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return null; // Don't render if no permission
  }

  return (
    <MenuItem
      active={selected === title}
      style={{ color: colors.grey[100] }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  // note: STATE & THEME
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selected, setSelected] = useState("Dashboard");
  const { hasPermission } = useAuth();

  // note: SIDEBAR STYLES
  const sidebarStyle = {
    height: "100%",
    "& .pro-sidebar-inner": {
      background: `${colors.primary[400]} !important`,
    },
    "& .pro-icon-wrapper": {
      backgroundColor: "transparent !important",
    },
    "& .pro-inner-item": {
      padding: "8px 24px !important",
    },
    "& .pro-inner-item:hover": {
      color: "#00B4DB !important",
    },
    "& .pro-menu-item.active": {
      color: "#00B4DB !important",
    },
    borderRight: `1px solid ${colors.primary[200]}`,
  };

  // note: LOGO CONFIG
  const logoConfig = {
    src: theme.palette.mode === "dark" ? darkModeLogo : lightModeLogo,
    alt: "Company Logo",
    style: {
      width: "44px",
      height: "44px",
      objectFit: "contain",
    },
  };

  // Helper function to check if submenu should be shown
  const shouldShowSubmenu = (items) => {
    return items.some(
      (item) =>
        !item.requiredPermission || hasPermission(item.requiredPermission)
    );
  };

  //  note: MENU ITEMS DATA WITH PERMISSIONS - SHORT TITLES (2-3 words)
  const menuItems = [
    {
      title: "Dashboard", // 1 word ✓
      to: "/",
      icon: <DashboardOutlinedIcon />,
      requiredPermission: null,
    },
  ];

  const productManagementSubmenu = [
    {
      title: "Categories", // 1 word ✓
      to: "/categories",
      icon: <CategoryOutlinedIcon />,
      requiredPermission: "view category",
    },
    {
      title: "Products", // 1 word ✓
      to: "/products",
      icon: <Inventory2OutlinedIcon />,
      requiredPermission: "view product",
    },
    {
      title: "Stock", // 1 word ✓
      to: "/stocks",
      icon: <InventoryOutlinedIcon />,
      requiredPermission: "view stock",
    },
  ];

  const salesOrdersSubmenu = [
    {
      title: "Orders", // 1 word ✓
      to: "/orders",
      icon: <ShoppingCartOutlinedIcon />,
      requiredPermission: "view order",
    },
    {
      title: "Customers", // 1 word ✓
      to: "/customers",
      icon: <GroupOutlinedIcon />,
      requiredPermission: "view customer",
    },
    {
      title: "Sale Report", // 1 word ✓
      to: "/sale-reports",
      icon: <GroupOutlinedIcon />,
      requiredPermission: "view report",
    },
  ];

  const purchaseFinanceSubmenu = [
    {
      title: "Transactions", // 1 word ✓
      to: "/transactions",
      icon: <ReceiptLongOutlinedIcon />,
      requiredPermission: "view transaction",
    },
    {
      title: "Suppliers", // 1 word ✓
      to: "/suppliers",
      icon: <LocalShippingOutlinedIcon />,
      requiredPermission: "view supplier",
    },
  ];

  const peopleManagementSubmenu = [
    {
      title: "Staff", // 1 word ✓
      to: "/staffs",
      icon: <PeopleAltOutlinedIcon />,
      requiredPermission: "view staff",
    },
  ];

  return (
    <Box sx={sidebarStyle}>
      <ProSidebar>
        <Menu iconShape="square">
          {/* logo section */}
          <MenuItem
            style={{
              margin: "20px 0 30px 0",
              color: colors.grey[100],
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="start"
              gap="12px"
              px="16px"
            >
              <img {...logoConfig} />
              <Typography variant="h6" color={colors.grey[100]}>
                Inventoryapp
              </Typography>
            </Box>
          </MenuItem>

          {/*  MENU ITEMS SECTION */}
          <Box>
            {/* Single Menu items */}
            {menuItems.map((item) => (
              <Item
                key={item.title}
                title={item.title}
                to={item.to}
                icon={item.icon}
                selected={selected}
                setSelected={setSelected}
                requiredPermission={item.requiredPermission}
              />
            ))}

            {/* Product Management Submenu */}
            {shouldShowSubmenu(productManagementSubmenu) && (
              <SubMenu
                title="Inventory Management"
                icon={<Inventory2OutlinedIcon />}
                style={{ color: colors.grey[100] }}
              >
                {productManagementSubmenu.map((item) => (
                  <Item
                    key={item.title}
                    title={item.title}
                    to={item.to}
                    icon={item.icon}
                    selected={selected}
                    setSelected={setSelected}
                    requiredPermission={item.requiredPermission}
                  />
                ))}
              </SubMenu>
            )}

            {/* Sales & Orders Submenu */}
            {shouldShowSubmenu(salesOrdersSubmenu) && (
              <SubMenu
                title="Sales" // 1 word ✓
                icon={<ShoppingCartOutlinedIcon />}
                style={{ color: colors.grey[100] }}
              >
                {salesOrdersSubmenu.map((item) => (
                  <Item
                    key={item.title}
                    title={item.title}
                    to={item.to}
                    icon={item.icon}
                    selected={selected}
                    setSelected={setSelected}
                    requiredPermission={item.requiredPermission}
                  />
                ))}
              </SubMenu>
            )}

            {/* Purchase & Finance Submenu */}
            {shouldShowSubmenu(purchaseFinanceSubmenu) && (
              <SubMenu
                title="Purchases" // 1 word ✓
                icon={<AccountBalanceOutlinedIcon />}
                style={{ color: colors.grey[100] }}
              >
                {purchaseFinanceSubmenu.map((item) => (
                  <Item
                    key={item.title}
                    title={item.title}
                    to={item.to}
                    icon={item.icon}
                    selected={selected}
                    setSelected={setSelected}
                    requiredPermission={item.requiredPermission}
                  />
                ))}
              </SubMenu>
            )}

            {/* People Management Submenu */}
            {shouldShowSubmenu(peopleManagementSubmenu) && (
              <SubMenu
                title="People" // 1 word ✓
                icon={<Groups2OutlinedIcon />}
                style={{ color: colors.grey[100] }}
              >
                {peopleManagementSubmenu.map((item) => (
                  <Item
                    key={item.title}
                    title={item.title}
                    to={item.to}
                    icon={item.icon}
                    selected={selected}
                    setSelected={setSelected}
                    requiredPermission={item.requiredPermission}
                  />
                ))}
              </SubMenu>
            )}
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
