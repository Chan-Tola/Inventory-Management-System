import api from "../api";

export const saleReportService = {
  getSaleReport: async (params = {}) => {
    try {
      // Validate parameters
      if (!params.date && !params.start_date) {
        throw new Error(
          "Please provide either 'date' or 'start_date' parameter"
        );
      }

      const res = await api.get("/sale-report", { params }); // ✅ Added leading slash

      console.log("Sale Report Response:", res.data);

      return res.data;
    } catch (error) {
      console.error(
        "Sale Report Service Error:",
        error.response?.data || error.message
      );

      // ✅ Better error handling
      if (error.response?.data) {
        throw error.response.data;
      } else if (error.message) {
        throw { message: error.message };
      } else {
        throw { message: "Failed to fetch sale report" };
      }
    }
  },

  /**
   * Get daily sales report
   * @param {string} date - Format: YYYY-MM-DD
   */
  getDailyReport: async (date) => {
    return saleReportService.getSaleReport({ date });
  },

  /**
   * Get weekly sales report
   * @param {string} startDate - Format: YYYY-MM-DD
   */
  getWeeklyReport: async (startDate) => {
    return saleReportService.getSaleReport({ start_date: startDate });
  },
};
