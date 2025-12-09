import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSaleReport,
  clearSaleReport,
  setReportType,
  clearError,
  clearSuccess,
} from "../redux/slices/saleReportSlice";

export const useSaleReport = () => {
  const dispatch = useDispatch();
  const {
    data: reportData,
    loading: isLoading,
    error: reportError,
    success: reportSuccess,
    reportType,
    generatedAt,
    lastParams,
  } = useSelector((state) => state.saleReport);

  // Track if auto-load has been done
  const hasAutoLoaded = useRef(false);

  // ✅ Clear success message after 3 seconds
  useEffect(() => {
    if (reportSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [reportSuccess, dispatch]);

  // ✅ Clear error message after 5 seconds
  useEffect(() => {
    if (reportError) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [reportError, dispatch]);

  // Main function to fetch daily report
  const getDailyReport = (date) => {
    dispatch(setReportType("daily"));
    return dispatch(fetchSaleReport({ date }));
  };

  // Main function to fetch weekly report
  const getWeeklyReport = (startDate) => {
    dispatch(setReportType("weekly"));
    return dispatch(fetchSaleReport({ start_date: startDate }));
  };

  // ✅ Smart report generation (auto-detects based on Monday)
  const getSmartReport = (selectedDate) => {
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday

    if (dayOfWeek === 1) {
      // Monday → Weekly report
      return getWeeklyReport(selectedDate);
    } else {
      // Other days → Daily report
      return getDailyReport(selectedDate);
    }
  };

  // ✅ Get today's report (with auto-load tracking)
  const getTodayReport = () => {
    const today = new Date().toISOString().split("T")[0];
    if (!hasAutoLoaded.current) {
      hasAutoLoaded.current = true;
    }
    return getSmartReport(today);
  };

  // ✅ Get this week's report (starting Monday)
  const getThisWeekReport = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);

    // Calculate last Monday
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(today.getDate() + diff);

    const startDate = monday.toISOString().split("T")[0];
    return getWeeklyReport(startDate);
  };

  // ✅ Clear report data
  const clearReport = () => {
    dispatch(clearSaleReport());
  };

  // Helper functions to extract data
  const getSummary = () => reportData?.summary || {};
  const getProductSales = () => reportData?.product_sales || [];
  const getDailyBreakdown = () => reportData?.daily_breakdown || [];
  const getPeriod = () => reportData?.period || {};

  return {
    // State
    reportData,
    isLoading,
    reportError,
    reportSuccess,
    reportType,
    generatedAt,
    lastParams,

    // Data getters
    getSummary,
    getProductSales,
    getDailyBreakdown,
    getPeriod,

    // Actions
    getDailyReport,
    getWeeklyReport,
    getSmartReport,
    getTodayReport,
    getThisWeekReport,
    clearReport,

    // Clear functions for snackbars
    clearError: () => dispatch(clearError()),
    clearSuccess: () => dispatch(clearSuccess()),

    // Status checkers
    hasData: !!reportData,
    hasError: !!reportError,
    isEmpty: !reportData && !isLoading && !reportError,
  };
};
