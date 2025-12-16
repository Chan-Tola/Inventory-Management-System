import * as XLSX from "xlsx";

export const exportSalesReport = (reportData) => {
  if (!reportData || !reportData.success) {
    alert("No valid report data to export");
    return;
  }

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (typeof amount !== "number" || isNaN(amount)) return "$0.00";
    return `$${amount.toFixed(2)}`;
  };

  // 1. SUMMARY SHEET
  //   const summaryData = [
  //     ["Sales Report Summary"],
  //     ["Report Type", reportData.report_type],
  //     [
  //       "Period",
  //       `${reportData.period.start_date} to ${reportData.period.end_date}`,
  //     ],
  //     ["Days", reportData.period.days],
  //     [],
  //     ["SUMMARY"],
  //     ["Total Sales", formatCurrency(reportData.summary.total_sales)],
  //     ["Total Orders", reportData.summary.total_orders],
  //     ["Total Items Sold", reportData.summary.total_items_sold],
  //     ["Unique Customers", reportData.summary.unique_customers],
  //     [
  //       "Average Order Value",
  //       formatCurrency(reportData.summary.average_order_value),
  //     ],
  //     ["Average Items Per Order", reportData.summary.average_items_per_order],
  //     [],
  //     ["Generated At", reportData.generated_at],
  //   ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  // Style summary sheet (column widths)
  summarySheet["!cols"] = [{ wch: 25 }, { wch: 25 }];

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // 2. PRODUCT SALES SHEET
  if (reportData.product_sales && reportData.product_sales.length > 0) {
    const productHeaders = [
      ["Product Sales"],
      [],
      [
        "Product ID",
        "Product Name",
        "Total Quantity",
        "Total Sales",
        "Order Count",
      ],
    ];

    const productRows = reportData.product_sales.map((product) => [
      product.product_id,
      product.product_name,
      product.total_quantity,
      formatCurrency(product.total_sales),
      product.order_count,
    ]);

    const productData = [...productHeaders, ...productRows];
    const productSheet = XLSX.utils.aoa_to_sheet(productData);

    // Add total row
    const totalSales = reportData.product_sales.reduce(
      (sum, p) => sum + p.total_sales,
      0
    );
    const totalQuantity = reportData.product_sales.reduce(
      (sum, p) => sum + p.total_quantity,
      0
    );

    XLSX.utils.sheet_add_aoa(
      productSheet,
      [[], ["TOTAL", "", totalQuantity, formatCurrency(totalSales), "", ""]],
      { origin: -1 }
    );

    productSheet["!cols"] = [
      { wch: 10 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      x,
    ];

    XLSX.utils.book_append_sheet(workbook, productSheet, "Product Sales");
  }

  // 3. DAILY BREAKDOWN SHEET
  //   if (reportData.daily_breakdown && reportData.daily_breakdown.length > 0) {
  //     const dailyHeaders = [
  //       ["Daily Breakdown"],
  //       [],
  //       ["Date", "Day", "Sales", "Orders", "Items Sold", "Average Order Value"],
  //     ];

  //     const dailyRows = reportData.daily_breakdown.map((day) => [
  //       day.date,
  //       day.day_name,
  //       formatCurrency(day.sales),
  //       day.orders,
  //       day.items_sold,
  //       formatCurrency(day.average_order_value),
  //     ]);

  //     const dailyData = [...dailyHeaders, ...dailyRows];
  //     const dailySheet = XLSX.utils.aoa_to_sheet(dailyData);

  //     // Add total row
  //     const totalDailySales = reportData.daily_breakdown.reduce(
  //       (sum, day) => sum + day.sales,
  //       0
  //     );
  //     const totalOrders = reportData.daily_breakdown.reduce(
  //       (sum, day) => sum + day.orders,
  //       0
  //     );
  //     const totalItems = reportData.daily_breakdown.reduce(
  //       (sum, day) => sum + parseInt(day.items_sold || 0),
  //       0
  //     );

  //     XLSX.utils.sheet_add_aoa(
  //       dailySheet,
  //       [
  //         [],
  //         [
  //           "TOTAL",
  //           "",
  //           formatCurrency(totalDailySales),
  //           totalOrders,
  //           totalItems,
  //           "",
  //         ],
  //       ],
  //       { origin: -1 }
  //     );

  //     dailySheet["!cols"] = [
  //       { wch: 15 },
  //       { wch: 15 },
  //       { wch: 15 },
  //       { wch: 10 },
  //       { wch: 12 },
  //       { wch: 20 },
  //     ];

  //     XLSX.utils.book_append_sheet(workbook, dailySheet, "Daily Breakdown");
  //   }

  // Generate file name with date
  const exportFileName = `sales_report_${reportData.period.start_date}_to_${reportData.period.end_date}.xlsx`;

  // Download the Excel file
  XLSX.writeFile(workbook, exportFileName);
};

export const exportSimpleSalesReport = (reportData) => {
  if (!reportData || !reportData.success) {
    alert("No valid report data to export");
    return;
  }

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (typeof amount !== "number" || isNaN(amount)) return "$0.00";
    return `$${amount.toFixed(2)}`;
  };

  const allData = [
    // ["SALES REPORT"],
    // [
    //   `Period: ${reportData.period.start_date} to ${reportData.period.end_date}`,
    // ],
    // [`Report Type: ${reportData.report_type}`],
    // [`Generated: ${reportData.generated_at}`],
    // [],
    // ["SUMMARY"],
    // ["Metric", "Value"],
    // ["Total Sales", formatCurrency(reportData.summary.total_sales)],
    // ["Total Orders", reportData.summary.total_orders],
    // ["Total Items Sold", reportData.summary.total_items_sold],
    // ["Unique Customers", reportData.summary.unique_customers],
    // [
    //   "Average Order Value",
    //   formatCurrency(reportData.summary.average_order_value),
    // ],
    // ["Average Items Per Order", reportData.summary.average_items_per_order],
    // [],
    ["PRODUCT SALES"],
    [
      "Product ID",
      "Product Name",
      "Quantity",
      "Sales",
      "Orders",
      //   "Avg Qty/Order",
    ],
    ...(reportData.product_sales || []).map((p) => [
      p.product_id,
      p.product_name,
      p.total_quantity,
      formatCurrency(p.total_sales),
      p.order_count,
      //   p.average_quantity_per_order,
    ]),
    [],
    // ["DAILY BREAKDOWN"],
    // ["Date", "Day", "Sales", "Orders", "Items Sold", "Avg Order Value"],
    // ...(reportData.daily_breakdown || []).map((d) => [
    //   d.date,
    //   d.day_name,
    //   formatCurrency(d.sales),
    //   d.orders,
    //   d.items_sold,
    //   formatCurrency(d.average_order_value),
    // ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(allData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");

  // Set column widths
  worksheet["!cols"] = [
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    // { wch: 18 },
  ];

  const exportFileName = `sales_${reportData.period.start_date}_${reportData.period.end_date}.xlsx`;
  XLSX.writeFile(workbook, exportFileName);
};
