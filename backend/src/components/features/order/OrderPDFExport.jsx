import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Download, Print, ArrowBack } from "@mui/icons-material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";

// IMPORTANT: Correct way to import and use jspdf-autotable
import autoTable from "jspdf-autotable";

// Apply autoTable plugin
jsPDF.API.autoTable = autoTable;

const OrderPDFExport = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  useEffect(() => {
    if (location.state?.order) {
      // Normalize product_name to always be a string
      const normalizedOrder = {
        ...location.state.order,
        items:
          location.state.order.items?.map((item) => ({
            ...item,
            product_name:
              typeof item.product_name === "object"
                ? item.product_name.name || "Product"
                : item.product_name || "Product",
          })) || [],
      };
      setOrder(normalizedOrder);
      console.log("Order data received and normalized:", normalizedOrder);
      setLoading(false);
    }
  }, [orderId, location.state]);

  useEffect(() => {
    if (order && !loading && !pdfGenerated) {
      generatePDF();
      setPdfGenerated(true);
    }
  }, [order, loading, pdfGenerated]);

  const generatePDF = () => {
    console.log("Generating PDF with order:", order);

    if (!order) {
      console.error("No order data available");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Parse amount to number
    const amount = parseFloat(order.total_amount) || 0;
    const totalQuantity =
      order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    // === FROM SECTION (STAFF INFO) ===
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("FROM", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`Staff Name: ${order.staff_name || "Unknown"}`, 20, yPos + 6);

    yPos += 15;

    // === TO SECTION (CUSTOMER INFO) ===
    doc.setFont("helvetica", "bold");
    doc.text("TO", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Customer Name: ${order.customer_name || "Unknown"}`,
      20,
      yPos + 6
    );
    doc.text(
      `Address: ${order.customer_address || "Customer Address"}`,
      20,
      yPos + 12
    );

    yPos += 25;

    // === RECEIPT HEADER (Right side) ===
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("RECEIPT", pageWidth - 20, yPos - 20, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Receipt #: ${order.order_code || order.id}`,
      pageWidth - 20,
      yPos - 14,
      {
        align: "right",
      }
    );
    doc.text(
      `Receipt Date: ${new Date(order.order_date).toLocaleDateString("en-US")}`,
      pageWidth - 20,
      yPos - 8,
      { align: "right" }
    );

    yPos += 10;

    // Items Table - MANUAL IMPLEMENTATION
    // Draw table header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255); // White text
    doc.setFillColor(0, 0, 0); // Black background

    // Header cells - CORRECTED COLUMN ORDER: Product Name first, then Quantity
    // Column positions: [20, 110, 140, 170]
    doc.rect(20, yPos, 90, 8, "F"); // Product Name (width: 90)
    doc.rect(110, yPos, 30, 8, "F"); // Quantity (width: 30)
    doc.rect(140, yPos, 30, 8, "F"); // Unit Price (width: 30)
    doc.rect(170, yPos, 25, 8, "F"); // Amount (width: 25)

    // Header text - CORRECTED COLUMN ORDER
    doc.text("Product Name", 20 + 45, yPos + 5, { align: "center" }); // Center of Product Name column
    doc.text("Quantity", 110 + 15, yPos + 5, { align: "center" }); // Center of Quantity column
    doc.text("Unit Price", 140 + 15, yPos + 5, { align: "center" }); // Center of Unit Price column
    doc.text("Amount", 170 + 12.5, yPos + 5, { align: "center" }); // Center of Amount column

    yPos += 8;

    // Reset text color for content
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    // Add order items
    if (order.items && order.items.length > 0) {
      order.items.forEach((item, index) => {
        if (index > 0) yPos += 7;
        const itemQuantity = item.quantity || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        const subtotal = parseFloat(item.subtotal) || 0;

        // Handle product_name
        const productName =
          typeof item.product_name === "object"
            ? item.product_name.name || "Product"
            : item.product_name || "Product";

        // Product Name (FIRST COLUMN)
        doc.text(productName, 20 + 5, yPos + 5, { maxWidth: 80 });

        // Quantity (SECOND COLUMN)
        doc.text(itemQuantity.toString(), 110 + 15, yPos + 5, {
          align: "center",
        });

        // Unit Price (THIRD COLUMN)
        doc.text(`$${unitPrice.toFixed(2)}`, 140 + 15, yPos + 5, {
          align: "right",
        });

        // Amount (FOURTH COLUMN)
        doc.text(`$${subtotal.toFixed(2)}`, 170 + 20, yPos + 5, {
          align: "right",
        });
      });
    } else {
      // If no items, show one row
      doc.text("Product", 20 + 5, yPos + 5);
      doc.text("1", 110 + 15, yPos + 5, { align: "center" });
      doc.text(`$0.00`, 140 + 15, yPos + 5, { align: "right" });
      doc.text(`$0.00`, 170 + 20, yPos + 5, { align: "right" });
    }

    yPos += 7;

    // Add empty rows to reach 7 total rows (including item rows)
    const totalRowsSoFar = order.items ? Math.min(order.items.length, 7) : 1;
    const emptyRowsNeeded = 7 - totalRowsSoFar;

    for (let i = 0; i < emptyRowsNeeded; i++) {
      // Just increase yPos without drawing anything
      yPos += 7;
    }

    // Draw grid lines
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1);

    // Calculate table height
    const tableHeight = 8 + 7 * 7; // Header + 7 rows * 7mm each

    // Vertical lines - CORRECTED POSITIONS
    doc.line(20, yPos - tableHeight + 8, 20, yPos + 7); // Left border
    doc.line(110, yPos - tableHeight + 8, 110, yPos + 7); // Between Product Name and Quantity
    doc.line(140, yPos - tableHeight + 8, 140, yPos + 7); // Between Quantity and Unit Price
    doc.line(170, yPos - tableHeight + 8, 170, yPos + 7); // Between Unit Price and Amount
    doc.line(195, yPos - tableHeight + 8, 195, yPos + 7); // Right border

    // Horizontal lines
    const tableTopY = yPos - tableHeight + 8;
    doc.line(20, tableTopY, 195, tableTopY); // Top line
    for (let i = 0; i <= 7; i++) {
      doc.line(20, tableTopY + i * 7, 195, tableTopY + i * 7);
    }

    // Totals Section
    yPos += 15;

    // Total Quantity
    doc.setFont("helvetica", "bold");
    doc.text("Total Quantity", pageWidth - 100, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(totalQuantity.toString(), pageWidth - 20, yPos, {
      align: "right",
    });

    yPos += 8;

    // Total Amount
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount", pageWidth - 100, yPos);
    doc.text(`$${amount.toFixed(2)}`, pageWidth - 20, yPos, {
      align: "right",
    });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Tel: +855 16 354 159", 20, footerY);
    doc.text("Email: chantola.ren@gmail.com", pageWidth / 2, footerY, {
      align: "center",
    });
    doc.text("Web: IMS.com", pageWidth - 20, footerY, { align: "right" });

    // Save PDF
    const fileName = `receipt-${order.order_code || order.id}.pdf`;
    doc.save(fileName);
    console.log(`PDF generated: ${fileName}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Container
        maxWidth="md"
        sx={{
          py: 4,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <Box textAlign="center">
          <CircularProgress sx={{ mb: 2, color: "black" }} />
          <Typography variant="body1" color="text.primary">
            Loading receipt...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: 4, minHeight: "100vh", bgcolor: "background.default" }}
      >
        <Alert severity="error" sx={{ mb: 3 }}>
          Order not found. Please go back and try again.
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          variant="outlined"
        >
          Back to Orders
        </Button>
      </Container>
    );
  }

  // Parse values to numbers
  const amount = parseFloat(order.total_amount) || 0;
  const totalQuantity =
    order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  return (
    <Container
      maxWidth="md"
      sx={{
        py: 4,
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      {/* Action Bar */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={handleBack}
            size="small"
            sx={{ color: "text.primary" }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Receipt #{order.order_code || order.id}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Generated on {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={generatePDF}
            sx={{
              bgcolor: "black",
              color: "white",
              "&:hover": { bgcolor: "#333" },
              borderRadius: 1,
            }}
          >
            Download PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
            sx={{
              borderColor: "divider",
              color: "text.primary",
              borderRadius: 1,
            }}
          >
            Print
          </Button>
        </Box>
      </Paper>

      {/* Receipt Content - Matching PDF Image */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 1,
          mb: 3,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* From section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="caption" fontWeight="bold" gutterBottom>
            FROM
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {"Staff Name : " + order.staff_name || "UnKnow"}
          </Typography>
        </Box>
        {/* TO section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="caption" fontWeight="bold" gutterBottom>
            TO
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {"Customer Name : " + order.customer_name || "UnKnow"}
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {"Address : " + order.customer_address || "Customer Address"}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Items Table - Matching PDF format */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            mb: 3,
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "black" }}>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    py: 1,
                  }}
                >
                  Product Name
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    py: 1,
                    width: "60px",
                    textAlign: "center",
                  }}
                >
                  Quantity
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    py: 1,
                    textAlign: "right",
                  }}
                >
                  Unit Price
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    py: 1,
                    textAlign: "right",
                  }}
                >
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Order Items */}
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => {
                  const unitPrice = parseFloat(item.unit_price) || 0;
                  const subtotal = parseFloat(item.subtotal) || 0;

                  // Get product name (already normalized, but keep for safety)
                  const productName =
                    typeof item.product_name === "object"
                      ? item.product_name.name || "Product"
                      : item.product_name || "Product";

                  return (
                    <TableRow key={item.id}>
                      <TableCell sx={{ py: 2 }}>{productName}</TableCell>
                      <TableCell
                        sx={{
                          py: 2,
                          textAlign: "center",
                        }}
                      >
                        {item.quantity || 0}
                      </TableCell>
                      <TableCell sx={{ py: 2 }} align="right">
                        ${unitPrice.toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ py: 2 }} align="right">
                        ${subtotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell sx={{ py: 2 }}>No items</TableCell>
                  <TableCell
                    sx={{
                      py: 2,
                      textAlign: "center",
                    }}
                  >
                    0
                  </TableCell>
                  <TableCell sx={{ py: 2 }} align="right">
                    $0.00
                  </TableCell>
                  <TableCell sx={{ py: 2 }} align="right">
                    $0.00
                  </TableCell>
                </TableRow>
              )}

              {/* Empty Rows to match PDF format (total 7 rows including items) */}
              {Array.from({
                length: Math.max(0, 7 - (order.items?.length || 1)),
              }).map((_, index) => (
                <TableRow key={`empty-${index}`}>
                  <TableCell sx={{ py: 1.5 }}></TableCell>
                  <TableCell
                    sx={{
                      py: 1.5,
                      textAlign: "center",
                    }}
                  ></TableCell>
                  <TableCell sx={{ py: 1.5 }} align="right"></TableCell>
                  <TableCell sx={{ py: 1.5 }} align="right"></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Totals Section - Right aligned */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ width: 300 }}>
            <Stack spacing={1}>
              {/* Total Quantity Row */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body1" fontWeight="bold">
                  Total Quantity
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {totalQuantity}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body1" fontWeight="bold">
                  Total Amount
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  ${amount.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* Footer - Contact info */}
        <Box
          sx={{
            mt: 6,
            pt: 3,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Tel: +855 16 354 159
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Email: chantola.ren@gmail.com
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Web: IMS.com
          </Typography>
        </Box>
      </Paper>

      {/* Print-only footer */}
      <Box
        sx={{ display: "none", "@media print": { display: "block", mt: 2 } }}
      >
        <Typography variant="caption" color="text.secondary">
          Printed on {new Date().toLocaleString()}
        </Typography>
      </Box>
    </Container>
  );
};

export default OrderPDFExport;
