import { useCallback, useEffect, useRef } from "react";
import { useTopSellingProducts } from "../../hooks/useTopSellingProducts";
import { Box, Typography, useTheme, Skeleton } from "@mui/material";
import { Notification } from "../../components/common";
import {
  TopsellProductTable,
  TopSellCard,
} from "../../components/features/topSellingProduct/index";
import { useDispatch } from "react-redux";
import { fetchTopSellingProducts } from "../../redux/slices/topSellProductSlice";
import { tokens } from "../../theme";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

const TopSellingProductsPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const {
    topSellProducts,
    loading,
    error,
    success,
    totalCount,
    totalSales,
    totalQuantity,
    handleCloseSnackbar,
  } = useTopSellingProducts();

  const hasFetched = useRef(false);

  const handleRefresh = useCallback(() => {
    dispatch(fetchTopSellingProducts());
  }, [dispatch]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      handleRefresh();
    }
  }, [handleRefresh]);

  // Stats cards data
  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalSales.toFixed(2)}`,
      icon: <TrendingUpIcon />,
      bgColor: "linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)",
    },
    {
      title: "Total Units Sold",
      value: totalQuantity.toLocaleString(),
      icon: <ShoppingCartOutlinedIcon />,
      bgColor: "linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)",
    },
    {
      title: "Avg Revenue per Product",
      value: `$${(totalCount > 0 ? totalSales / totalCount : 0).toFixed(2)}`,
      icon: <AccountBalanceIcon />,
      bgColor: "linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)",
    },
  ];

  return (
    <Box p={3}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Top Selling Products
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards Grid */}
      {loading && topSellProducts.length === 0 ? (
        // Loading skeleton for cards
        <Box display="flex" gap={3} mb={4} flexWrap="wrap">
          {[1, 2, 3].map((item) => (
            <Skeleton
              key={item}
              variant="rounded"
              width="100%"
              height={120}
              sx={{ flex: 1, minWidth: 240, borderRadius: 3 }}
            />
          ))}
        </Box>
      ) : (
        // Actual stats cards using TopSellCard component
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
          gap={2}
          sx={{ mb: 4, width: "100%" }}
        >
          {stats.map((stat) => (
            <TopSellCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              bgColor={stat.bgColor}
            />
          ))}
        </Box>
      )}

      {/* Top Sell Table */}
      <TopsellProductTable
        topSellProducts={topSellProducts}
        loading={loading}
      />

      {/* Error State */}
      {error && (
        <Box sx={{ mt: 3, p: 2, bgcolor: "error.light", borderRadius: 2 }}>
          <Typography color="error" variant="body1">
            Error loading products data: {error}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TopSellingProductsPage;
