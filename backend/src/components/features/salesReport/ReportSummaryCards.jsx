import { Grid, Paper, Typography, Box } from "@mui/material";
import {
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  TrendingUp as TrendingIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";

const SummaryCard = ({ title, value, icon, color, subtitle }) => (
  <Paper
    sx={{
      p: 3,
      height: "100%",
      borderLeft: `4px solid ${color}`,
      transition: "transform 0.2s",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: 3,
      },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      <Box
        sx={{
          bgcolor: `${color}20`,
          p: 1,
          borderRadius: 2,
          mr: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
    </Box>
    <Typography variant="h5" fontWeight="bold" gutterBottom>
      {value}
    </Typography>
    {subtitle && (
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </Paper>
);

const ReportSummaryCards = ({ summary }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const cards = [
    {
      title: "Total Sales",
      value: formatCurrency(summary.total_sales),
      icon: <MoneyIcon sx={{ color: "#4CAF50" }} />,
      color: "#4CAF50",
      subtitle: `Revenue`,
    },
    {
      title: "Total Orders",
      value: summary.total_orders,
      icon: <ReceiptIcon sx={{ color: "#2196F3" }} />,
      color: "#2196F3",
      subtitle: `Completed orders`,
    },
    {
      title: "Items Sold",
      value: summary.total_items_sold,
      icon: <InventoryIcon sx={{ color: "#FF9800" }} />,
      color: "#FF9800",
      subtitle: `Total units`,
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(summary.average_order_value),
      icon: <TrendingIcon sx={{ color: "#9C27B0" }} />,
      color: "#9C27B0",
      subtitle: `Per order`,
    },
    {
      title: "Unique Customers",
      value: summary.unique_customers,
      icon: <PeopleIcon sx={{ color: "#00BCD4" }} />,
      color: "#00BCD4",
      subtitle: `Active customers`,
    },
    {
      title: "Avg Items/Order",
      value: summary.average_items_per_order?.toFixed(1) || "0.0",
      icon: <CartIcon sx={{ color: "#795548" }} />,
      color: "#795548",
      subtitle: `Items per order`,
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
          <SummaryCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ReportSummaryCards;
