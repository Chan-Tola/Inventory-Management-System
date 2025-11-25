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
import AirportShuttleOutlinedIcon from "@mui/icons-material/AirportShuttleOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import CurrencyExchangeOutlinedIcon from "@mui/icons-material/CurrencyExchangeOutlined";

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
    height: "100vh",
    "& .pro-sidebar-inner": {
      background: `${colors.primary[400]} !important`,
    },
    "& .pro-icon-wrapper": {
      backgroundColor: "transparent !important",
    },
    "& .pro-inner-item": {
      padding: "5px 20px !important",
    },
    "& .pro-inner-item:hover": {
      color: "#00B4DB !important",
    },
    "& .pro-menu-item.active": {
      color: "#00B4DB !important",
    },
    borderRight: `2px solid ${colors.primary[100]}`,
  };

  // note: LOGO CONFIG
  const logoConfig = {
    src: theme.palette.mode === "dark" ? darkModeLogo : lightModeLogo,
    alt: "Company Logo",
    style: {
      width: "50px",
      height: "50px",
      objectFit: "contain",
      borderRadius: "8px",
    },
  };

  // Helper function to check if submenu should be shown
  const shouldShowSubmenu = (items) => {
    return items.some(
      (item) =>
        !item.requiredPermission || hasPermission(item.requiredPermission)
    );
  };

  //  note: MENU ITEMS DATA WITH PERMISSIONS
  const menuItems = [
    {
      title: "Dashboard",
      to: "/",
      icon: <DashboardOutlinedIcon />,
      requiredPermission: null, // Everyone can see dashboard
    },
  ];

  const userManagementSubmenu = [
    {
      title: "Staff Members",
      to: "/staffs",
      icon: <AccountCircleOutlinedIcon />,
      requiredPermission: "view staff",
    },
    {
      title: "Customers",
      to: "/customers",
      icon: <GroupOutlinedIcon />,
      requiredPermission: "view customer",
    },
  ];

  const productManagementSubmenu = [
    {
      title: "Category",
      to: "/categories",
      icon: <CategoryOutlinedIcon />,
      requiredPermission: "view category",
    },
    {
      title: "Products",
      to: "/products",
      icon: <ListAltOutlinedIcon />,
      requiredPermission: "view product",
    },
    {
      title: "Stock products",
      to: "/stocks",
      icon: <InventoryOutlinedIcon />,
      requiredPermission: "view stock",
    },
    {
      title: "Transaction",
      to: "/transition",
      icon: <InventoryOutlinedIcon />,
      requiredPermission: "view transaction",
    },
  ];

  const financialRecordsSubmenu = [
    {
      title: "Transactions",
      to: "/transactions",
      icon: <ReceiptOutlinedIcon />,
      requiredPermission: "view transaction",
    },
    {
      title: "Suppliers",
      to: "/suppliers",
      icon: <AirportShuttleOutlinedIcon />,
      requiredPermission: "view supplier",
    },
  ];

  return (
    <Box sx={sidebarStyle}>
      <ProSidebar>
        <Menu iconShape="square">
          {/* logo section */}
          <MenuItem
            style={{
              margin: "15px 0 25px 0",
              color: colors.grey[100],
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="start"
              gap="10px"
              px="10px"
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

            {/* Product Management Submenu - Only show if user has at least one permission */}
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

            {/* Staff Management Submenu - Only show if user has at least one permission */}
            {shouldShowSubmenu(userManagementSubmenu) && (
              <SubMenu
                title="User Management"
                icon={<Groups2OutlinedIcon />}
                style={{ color: colors.grey[100] }}
              >
                {userManagementSubmenu.map((item) => (
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

            {/* Transition Management Submenu - Only show if user has at least one permission */}
            {shouldShowSubmenu(financialRecordsSubmenu) && (
              <SubMenu
                title="Financial Management"
                icon={<CurrencyExchangeOutlinedIcon />}
                style={{ color: colors.grey[100] }}
              >
                {financialRecordsSubmenu.map((item) => (
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
