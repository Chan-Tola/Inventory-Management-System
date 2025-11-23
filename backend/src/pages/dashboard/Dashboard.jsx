import {
  LineChartComponent,
  Card,
  // PieChartComponent,
  BarChartComponent,
} from "../../components/features/dashboard/index";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import { Box, Typography } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { useProduct } from "../../hooks/useProduct";
import { useStaff } from "../../hooks/useStaff";

const Dashboard = () => {
  const { user } = useAuth();
  const { productItems } = useProduct();
  const { staffItems } = useStaff();
  // Example static data for card
  const stats = [
    {
      title: "Staff",
      value: staffItems.length,
      icon: <Groups2OutlinedIcon />,
      bgColor: "#4caf50",
    },
    {
      title: "Products",
      value: productItems.length,
      icon: <Inventory2OutlinedIcon />,
      bgColor: "#2196f3",
    },
    {
      title: "Orders",
      value: 23,
      icon: <ShoppingCartOutlinedIcon />,
      bgColor: "#ff9800",
    },
    {
      title: "Income",
      value: "$12,000",
      icon: <AttachMoneyOutlinedIcon />,
      bgColor: "#9c27b0",
    },
    {
      title: "Expenses",
      value: "$5,000",
      icon: <AttachMoneyOutlinedIcon />,
      bgColor: "#f44336",
    },
  ];
  // Static line graph data
  const lineGraphData = [
    { month: "Jan", sales: 4000, expenses: 2000 },
    { month: "Feb", sales: 3000, expenses: 1500 },
    { month: "Mar", sales: 5000, expenses: 2500 },
    { month: "Apr", sales: 4000, expenses: 2000 },
    { month: "May", sales: 6000, expenses: 3000 },
    { month: "Jun", sales: 7000, expenses: 3500 },
    { month: "Jul", sales: 5000, expenses: 2500 },
    { month: "Aug", sales: 6000, expenses: 3000 },
    { month: "Sep", sales: 7000, expenses: 3500 },
    { month: "Oct", sales: 8000, expenses: 4000 },
    { month: "Nov", sales: 9000, expenses: 4500 },
    { month: "Dec", sales: 10000, expenses: 5000 },
  ];
  // static data for dashboard data
  const dashboardData = [
    { name: "Products", value: 120 },
    { name: "Orders", value: 80 },
    { name: "Staff", value: 50 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];
  return (
    <>
      {/* Welcome Section */}
      <Box mb={4} px={2}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Welcome, {user?.name} 👋🏻
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage with system makes your life better
        </Typography>
      </Box>

      {/* Stats Cards Grid */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
        gap={2}
        p={2}
      >
        {stats.map((stat) => (
          <Card
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            bgColor={stat.bgColor}
          />
        ))}
      </Box>
      {/* Chart Section */}
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
            Line Graph Overview
          </Typography>
          <LineChartComponent data={lineGraphData} />
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
            BarChart Overview
          </Typography>
          <BarChartComponent data={lineGraphData} />
        </Box>
        {/* Pie Chart Container */}
        {/* <Box
          sx={{
            flex: 1,
            minHeight: 400,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" gutterBottom color="primary.main">
            Distribution
          </Typography>
          <PieChartComponent data={dashboardData} colors={COLORS} />
        </Box> */}
      </Box>
    </>
  );
};

export default Dashboard;
