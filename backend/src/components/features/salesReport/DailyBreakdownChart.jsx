import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Paper, Typography, Box } from "@mui/material";

const DailyBreakdownChart = ({ dailyData }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const chartData = dailyData.map((day) => ({
    name: day.date.split("-")[2], // Just show day number
    fullDate: day.date,
    dayName: day.day_name.substring(0, 3), // Short day name
    sales: day.sales,
    orders: day.orders,
    items: day.items_sold,
  }));

  const getBarColor = (value, maxValue) => {
    const ratio = value / maxValue;
    if (ratio > 0.7) return "#4CAF50"; // Green for high sales
    if (ratio > 0.4) return "#2196F3"; // Blue for medium sales
    return "#FF9800"; // Orange for low sales
  };

  const maxSales = Math.max(...chartData.map((d) => d.sales));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 2, border: "1px solid #ddd" }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {data.fullDate} ({data.dayName})
          </Typography>
          <Typography variant="body2">
            Sales: <strong>{formatCurrency(data.sales)}</strong>
          </Typography>
          <Typography variant="body2">
            Orders: <strong>{data.orders}</strong>
          </Typography>
          <Typography variant="body2">
            Items: <strong>{data.items}</strong>
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Sales by Day
      </Typography>

      <Box sx={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tickFormatter={(value, index) =>
                `${value}\n${chartData[index]?.dayName}`
              }
            />
            <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="sales" name="Sales" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.sales, maxSales)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Legend */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{ width: 12, height: 12, bgcolor: "#4CAF50", borderRadius: 1 }}
          />
          <Typography variant="caption">High Sales</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{ width: 12, height: 12, bgcolor: "#2196F3", borderRadius: 1 }}
          />
          <Typography variant="caption">Medium Sales</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{ width: 12, height: 12, bgcolor: "#FF9800", borderRadius: 1 }}
          />
          <Typography variant="caption">Low Sales</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DailyBreakdownChart;
