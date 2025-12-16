import React from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

const ReportControls = ({
  reportType,
  setReportType,
  selectedDate,
  setSelectedDate,
  onGenerate,
  onQuickAction,
  onClear,
  isLoading,
}) => {
  const quickActions = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "This Week", value: "thisWeek" },
    { label: "Last Week", value: "lastWeek" },
  ];

  return (
    <Box>
      {/* Main Controls Row */}
      <Grid container spacing={1} alignItems="center">
        {/* Report Type */}
        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select
              value={reportType}
              label="Type"
              onChange={(e) => setReportType(e.target.value)}
              disabled={isLoading}
            >
              <MenuItem value="smart">Smart</MenuItem>
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Date Picker */}
        <Grid item xs={12} sm={4} md={3}>
          <TextField
            fullWidth
            size="small"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={isLoading}
          />
        </Grid>

        {/* Generate Button */}
        <Grid item xs={6} sm={2} md={2}>
          <Button
            fullWidth
            variant="contained"
            size="medium"
            onClick={onGenerate}
            disabled={isLoading}
          >
            {isLoading ? "..." : "Search"}
          </Button>
        </Grid>

        {/* Clear Button */}
        <Grid item xs={6} sm={2} md={1}>
          <Button
            fullWidth
            variant="outlined"
            size="medium"
            onClick={onClear}
            disabled={isLoading}
          >
            Clear
          </Button>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 2 }}>
        <Stack direction="row" spacing={1}>
          {quickActions.map((action) => (
            <Chip
              key={action.value}
              label={action.label}
              size="small"
              onClick={() => onQuickAction(action.value)}
              disabled={isLoading}
              variant="outlined"
              clickable
            />
          ))}
        </Stack>
      </Box>

      {/* Smart Mode Note */}
      {reportType === "smart" && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          Smart: Weekly on Monday, otherwise daily
        </Typography>
      )}
    </Box>
  );
};

export default ReportControls;
