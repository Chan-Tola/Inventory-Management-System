import {
  LineChartComponent,
  Card,
  BarChartComponent,
} from "../../components/features/dashboard/index";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import { Box, Typography, Paper, useTheme } from "@mui/material";
// Hook
import { useAuth } from "../../hooks/useAuth";
import { useTransaction } from "../../hooks/useTransaction";
import { useMonthlyStats } from "../../hooks/useMonthlyStats";
import { useFinancialStats } from "../../hooks/useFinancialStats";
import { useCustomer } from "../../hooks/useCustomer";

const Dashboard = () => {
  const { user } = useAuth();
  const { customerItems } = useCustomer();
  const { transactionItems } = useTransaction();
  const theme = useTheme();

  // 🆕 Use custom hooks for data calculation
  const monthlyTransactionData = useMonthlyStats(transactionItems);
  const financialStats = useFinancialStats(transactionItems);

  // Format currency for cards
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Enhanced stats with better visual indicators
  const stats = [
    {
      title: "Customers",
      value: customerItems.length,
      icon: <GroupOutlinedIcon />,
      bgColor: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
      trend: null,
    },
    {
      title: "Orders",
      value: transactionItems.length,
      icon: <ShoppingCartOutlinedIcon />,
      bgColor: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
      trend: null,
    },
    {
      title: "Income",
      value: formatCurrency(financialStats.totalIncome),
      icon: <TrendingUpIcon />,
      bgColor: "linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)",
      trend: "up",
    },
    {
      title: "Expenses",
      value: formatCurrency(financialStats.totalExpenses),
      icon: <TrendingDownIcon />,
      bgColor: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
      trend: "down",
    },
    {
      title: "Net Profit",
      value: formatCurrency(financialStats.netProfit),
      icon: <AccountBalanceIcon />,
      bgColor:
        financialStats.netProfit >= 0
          ? "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)"
          : "linear-gradient(135deg, #ff5722 0%, #d84315 100%)",
      trend: financialStats.netProfit >= 0 ? "up" : "down",
    },
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Enhanced Welcome Section */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: { xs: 2, sm: 3 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          color="primary.main"
        >
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ opacity: 0.8 }}>
          Here's what's happening with your business today
        </Typography>
      </Paper>

      {/* Full Width Stats Cards Grid */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
        gap={2}
        sx={{ mb: 4, width: "100%" }}
      >
        {stats.map((stat) => (
          <Card
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            bgColor={stat.bgColor}
            trend={stat.trend}
          />
        ))}
      </Box>
      {/* Large Chart Section - Similar to original layout */}
      <Box
        p={3}
        display="flex"
        flexDirection={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        alignItems="center"
        gap={3}
      >
        {/* Line Chart Container */}
        <Box
          sx={{
            flex: 1,
            minHeight: 400,
            width: "100%",
          }}
        >
          <Typography variant="h6" gutterBottom color="primary.main">
            Income vs Expenses Trend (Line Chart)
          </Typography>
          <LineChartComponent data={monthlyTransactionData} />
        </Box>
        {/* Line Chart Container */}
        <Box
          sx={{
            flex: 1,
            minHeight: 400,
            width: "100%",
          }}
        >
          <Typography variant="h6" gutterBottom color="primary.main">
            Monthly Comparison (Bar Chart)
          </Typography>
          <BarChartComponent data={monthlyTransactionData} />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
