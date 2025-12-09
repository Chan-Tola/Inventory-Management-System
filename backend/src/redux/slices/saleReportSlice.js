import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { saleReportService } from "../../services/saleReport/saleReportService";

export const fetchSaleReport = createAsyncThunk(
  "saleReport/fetchSaleReport",
  async (params, { rejectWithValue }) => {
    try {
      const data = await saleReportService.getSaleReport(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial State
const initialState = {
  data: null,
  loading: false,
  error: null,
  success: null,
  lastParams: null,
  reportType: null, // "daily" or "weekly"
  generatedAt: null,
};

const saleReportSlice = createSlice({
  name: "saleReport",
  initialState,
  reducers: {
    // clear sale report data
    clearSaleReport: (state) => {
      state.data = null;
      state.error = null;
      state.success = null;
      state.lastParams = null;
      state.reportType = null;
      state.generatedAt = null;
    },

    // Set report type
    setReportType: (state, action) => {
      state.reportType = action.payload; // "daily" or "weekly"
    },

    clearError: (state) => {
      state.error = null;
    },

    clearSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sale report pending
      .addCase(fetchSaleReport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
        state.data = null;
      })
      // Fetch sale report fulfilled
      .addCase(fetchSaleReport.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
        state.success = "Report generated successfully";
        state.reportType = action.payload.report_type;
        state.generatedAt = new Date().toISOString();
        state.lastParams = action.meta.arg;
      })

      // Fetch sale report rejected
      .addCase(fetchSaleReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch sale report";
        state.success = null;
        state.data = null;
      });
  },
});
export const { clearSaleReport, setReportType, clearError, clearSuccess } =
  saleReportSlice.actions;
export default saleReportSlice.reducer;
