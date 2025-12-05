import {
  LineChartComponent,
  Card,
  BarChartComponent,
} from "../../components/features/dashboard/index";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import {
  Box,
  Typography,
  Paper,
  useTheme,
  CircularProgress,
  Skeleton,
} from "@mui/material";
// Hooks
import { useAuth } from "../../hooks/useAuth";
import { useMonthlyStats } from "../../hooks/useMonthlyStats";
import { useFinancialStats } from "../../hooks/useFinancialStats";
import { useTransaction } from "../../hooks/useTransaction";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux"; // ✅ Add useSelector
import { fetchTransactions } from "../../redux/slices/transactionSlice"; // Note: check if this is fetchTransaction or fetchTransactions

const Dashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const dispatch = useDispatch();

  // ✅ Get transaction state directly from Redux for Dashboard
  const { transactionItems, loading, error } = useSelector(
    (state) => state.transactions
  );

  const hasFetched = useRef(false);

  // ✅ Only call once
  const handleRefresh = useCallback(() => {
    // Check which function name is correct in your slice
    dispatch(fetchTransactions()); // or fetchTransaction() depending on your slice
  }, [dispatch]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      handleRefresh();
    }
  }, [handleRefresh]);

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

  // // ✅ Show loading state
  // if (loading && transactionItems.length === 0) {
  //   return (
  //     <Box
  //       sx={{
  //         p: 4,
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         height: "50vh",
  //       }}
  //     >
  //       <CircularProgress size={40} sx={{ mr: 2 }} />
  //       <Typography variant="h6">Loading dashboard data...</Typography>
  //     </Box>
  //   );
  // }
  if (loading && transactionItems.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        {/* Header Skeleton */}
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="60%" height={24} />
        </Box>

        {/* Stats Skeleton */}
        <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
          {[1, 2, 3].map((item) => (
            <Skeleton
              key={item}
              variant="rounded"
              width="100%"
              height={120}
              sx={{ flex: 1 }}
            />
          ))}
        </Box>

        {/* Table Skeleton */}
        <Skeleton variant="rounded" height={300} sx={{ mb: 2 }} />

        {/* Loading indicator */}
        {/* <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 4,
          }}
        >
          <CircularProgress size={30} sx={{ mr: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Loading transaction data...
          </Typography>
        </Box> */}
      </Box>
    );
  }

  // ✅ Show error state
  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error" variant="h6">
          Error loading dashboard data: {error}
        </Typography>
      </Box>
    );
  }

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

      {/* Large Chart Section */}
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

        {/* Bar Chart Container */}
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
