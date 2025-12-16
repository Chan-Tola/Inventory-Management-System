// SalesReportPage.jsx (updated)
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Paper,
  Grid,
  Alert,
  Snackbar,
  Typography,
} from "@mui/material";
import {
  ReportControls,
  DailyBreakdownChart,
  ProductSalesTable,
  ExportButtons,
} from "../../components/features/salesReport/index";
import { useSaleReport } from "../../hooks/useSaleReport";
import { Notification } from "../../components/common/index";

const SalesReportPage = () => {
  const {
    reportData,
    isLoading,
    reportError,
    reportSuccess,
    getDailyReport,
    getWeeklyReport,
    getSmartReport,
    getTodayReport,
    getThisWeekReport,
    clearReport,
    hasData,
    clearError,
    clearSuccess,
  } = useSaleReport();

  const [reportType, setReportType] = useState("smart");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    getTodayReport();
  }, []);

  const handleGenerateReport = () => {
    if (reportType === "daily") {
      getDailyReport(selectedDate);
    } else if (reportType === "weekly") {
      getWeeklyReport(selectedDate);
    } else {
      getSmartReport(selectedDate);
    }
  };

  const handleQuickAction = (action) => {
    const today = new Date();

    switch (action) {
      case "today":
        getTodayReport();
        setSelectedDate(today.toISOString().split("T")[0]);
        break;
      case "thisWeek":
        getThisWeekReport();
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        monday.setDate(today.getDate() + diff);
        setSelectedDate(monday.toISOString().split("T")[0]);
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        getDailyReport(yesterday.toISOString().split("T")[0]);
        setSelectedDate(yesterday.toISOString().split("T")[0]);
        break;
      case "lastWeek":
        const lastMonday = new Date(today);
        lastMonday.setDate(
          today.getDate() - 7 - (today.getDay() === 0 ? 6 : today.getDay() - 1)
        );
        getWeeklyReport(lastMonday.toISOString().split("T")[0]);
        setSelectedDate(lastMonday.toISOString().split("T")[0]);
        break;
      default:
        break;
    }
  };

  const handleCloseSnackbar = () => {
    clearError();
    clearSuccess();
  };

  return (
    <Box p={3}>
      {/* Page Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Sales Report
        </Typography>

        {/* Export Button - Top right corner */}
        {hasData && reportData && !isLoading && (
          <ExportButtons reportData={reportData} />
        )}
      </Box>

      {/* Report Controls */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <ReportControls
          reportType={reportType}
          setReportType={setReportType}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onGenerate={handleGenerateReport}
          onQuickAction={handleQuickAction}
          onClear={clearReport}
          isLoading={isLoading}
        />
      </Paper>

      {/* Notification */}
      <Notification
        open={reportSuccess}
        message="Operation completed successfully!"
        severity="success"
        onClose={handleCloseSnackbar}
        autoHideDuration={3000}
      />

      {/* Report Content */}
      {hasData && reportData && !isLoading ? (
        <Box>
          {/* Export button is now in the header - removed from here */}

          {/* Daily Breakdown - Full width at the top */}
          {reportData.report_type === "weekly" && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight="600">
                  Daily Sales Breakdown
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {reportData.period.start_date} → {reportData.period.end_date}
                </Typography>
              </Box>
              <DailyBreakdownChart dailyData={reportData.daily_breakdown} />
            </Paper>
          )}

          {/* Product Sales Table - Below Daily Breakdown */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}
            >
              <Typography variant="h6" fontWeight="600">
                Product Sales
              </Typography>
            </Box>
            <Box sx={{ p: 1 }}>
              <ProductSalesTable reportData={reportData.product_sales} />
            </Box>
          </Paper>
        </Box>
      ) : isLoading ? (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" gutterBottom color="text.secondary">
            Loading Report...
          </Typography>
        </Paper>
      ) : (
        !reportError && (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: "center",
              borderRadius: 2,
              border: "1px dashed",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" gutterBottom color="text.secondary">
              No Report Generated
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use the controls above to generate a sales report
            </Typography>
          </Paper>
        )
      )}
    </Box>
  );
};

export default SalesReportPage;
