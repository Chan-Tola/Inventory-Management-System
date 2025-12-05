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
  Grid,
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
      setOrder(location.state.order);
      console.log("Order data received:", location.state.order);
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
    if (!order) return;

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Parse amount to number
    const amount = parseFloat(order.total_amount) || 0;
    const totalQuantity =
      order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    // Company Info (From)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("FROM", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text("YOUR COMPANY", 20, yPos + 6);
    doc.text("Your Address 1234", 20, yPos + 12);
    doc.text("CA 12345", 20, yPos + 18);

    // Receipt Header (Right side)
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("RECEIPT", pageWidth - 20, yPos + 5, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Receipt #: ${order.order_code || order.id}`,
      pageWidth - 20,
      yPos + 15,
      {
        align: "right",
      }
    );
    doc.text(
      `Receipt Date: ${new Date(order.order_date).toLocaleDateString("en-US")}`,
      pageWidth - 20,
      yPos + 21,
      { align: "right" }
    );

    yPos += 40;

    // Customer Info (To)
    doc.setFont("helvetica", "bold");
    doc.text("TO", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(order.customer_name || "Customer Name", 20, yPos + 6);
    doc.text("Customer Address 1234", 20, yPos + 12);
    doc.text("CA 12345", 20, yPos + 18);

    yPos += 40;

    // Items Table - MANUAL IMPLEMENTATION
    // Draw table header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255); // White text
    doc.setFillColor(0, 0, 0); // Black background

    // Header cells
    doc.rect(20, yPos, 15, 8, "F");
    doc.rect(35, yPos, 80, 8, "F");
    doc.rect(115, yPos, 40, 8, "F");
    doc.rect(155, yPos, 40, 8, "F");

    // Header text
    doc.text("QTY", 20 + 7.5, yPos + 5, { align: "center" });
    doc.text("Description", 35 + 40, yPos + 5, { align: "center" });
    doc.text("Unit Price", 115 + 20, yPos + 5, { align: "center" });
    doc.text("Amount", 155 + 20, yPos + 5, { align: "center" });

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

        doc.text(itemQuantity.toString(), 20 + 7.5, yPos + 5, {
          align: "center",
        });
        doc.text(item.product_name || "Product", 35 + 5, yPos + 5);
        doc.text(`$${unitPrice.toFixed(2)}`, 115 + 20, yPos + 5, {
          align: "right",
        });
        doc.text(`$${subtotal.toFixed(2)}`, 155 + 20, yPos + 5, {
          align: "right",
        });
      });
    } else {
      // If no items, show one row
      doc.text("1", 20 + 7.5, yPos + 5, { align: "center" });
      doc.text("Product", 35 + 5, yPos + 5);
      doc.text(`$0.00`, 115 + 20, yPos + 5, { align: "right" });
      doc.text(`$0.00`, 155 + 20, yPos + 5, { align: "right" });
    }

    yPos += 7;

    // Add empty rows to reach 7 total rows (including item rows)
    const totalRowsSoFar = order.items ? Math.min(order.items.length, 7) : 1;
    const emptyRowsNeeded = 7 - totalRowsSoFar;

    for (let i = 0; i < emptyRowsNeeded; i++) {
      doc.text("", 20, yPos + 5);
      doc.text("", 35, yPos + 5);
      doc.text("", 115, yPos + 5);
      doc.text("", 155, yPos + 5);
      yPos += 7;
    }

    // Draw grid lines
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1);

    // Calculate table height
    const tableHeight = 8 + 7 * 7; // Header + 7 rows * 7mm each

    // Vertical lines
    doc.line(20, yPos - tableHeight + 8, 20, yPos + 7);
    doc.line(35, yPos - tableHeight + 8, 35, yPos + 7);
    doc.line(115, yPos - tableHeight + 8, 115, yPos + 7);
    doc.line(155, yPos - tableHeight + 8, 155, yPos + 7);
    doc.line(195, yPos - tableHeight + 8, 195, yPos + 7);

    // Horizontal lines
    const tableTopY = yPos - tableHeight + 8;
    doc.line(20, tableTopY, 195, tableTopY); // Top line
    for (let i = 0; i <= 7; i++) {
      doc.line(20, tableTopY + i * 7, 195, tableTopY + i * 7);
    }

    // Totals Section
    yPos += 15;

    // Subtotal
    doc.setFontSize(10);
    doc.text("Subtotal", pageWidth - 100, yPos);
    doc.text(`$${amount.toFixed(2)}`, pageWidth - 20, yPos, { align: "right" });

    // Tax (assuming 5% tax included in total)
    const taxRate = 0.05;
    const taxAmount = amount * taxRate;
    doc.text(
      `Sales Tax (${(taxRate * 100).toFixed(0)}%)`,
      pageWidth - 100,
      yPos + 8
    );
    doc.text(`$${taxAmount.toFixed(2)}`, pageWidth - 20, yPos + 8, {
      align: "right",
    });

    // Total
    doc.setFont("helvetica", "bold");
    doc.text("Total", pageWidth - 100, yPos + 16);
    doc.text(`$${(amount + taxAmount).toFixed(2)}`, pageWidth - 20, yPos + 16, {
      align: "right",
    });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Tel: +1 234 56 789", 20, footerY);
    doc.text("Email: company@email.com", pageWidth / 2, footerY, {
      align: "center",
    });
    doc.text("Web: company.com", pageWidth - 20, footerY, { align: "right" });

    // Save PDF
    doc.save(`receipt-${order.order_code || order.id}.pdf`);
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
  const taxRate = 0.05;
  const taxAmount = amount * taxRate;
  const totalAmount = amount + taxAmount;

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
        {/* Header - From and To sections */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* FROM section */}
          <Grid item xs={6}>
            <Box>
              <Typography variant="caption" fontWeight="bold" gutterBottom>
                FROM
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                YOUR COMPANY
              </Typography>
              <Typography variant="body2">Your Address 1234</Typography>
              <Typography variant="body2">CA 12345</Typography>
            </Box>
          </Grid>

          {/* RECEIPT header right side */}
          <Grid item xs={6}>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                RECEIPT
              </Typography>
              <Typography variant="body2">
                <strong>Receipt #:</strong> {order.order_code || order.id}
              </Typography>
              <Typography variant="body2">
                <strong>Receipt Date:</strong>{" "}
                {new Date(order.order_date).toLocaleDateString("en-US")}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* TO section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="caption" fontWeight="bold" gutterBottom>
            TO
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {order.customer_name || "Customer Name"}
          </Typography>
          <Typography variant="body2">Customer Address 1234</Typography>
          <Typography variant="body2">CA 12345</Typography>
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
                    width: "60px",
                    textAlign: "center",
                  }}
                >
                  QTY
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    py: 1,
                  }}
                >
                  Description
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
                order.items.map((item, index) => {
                  const unitPrice = parseFloat(item.unit_price) || 0;
                  const subtotal = parseFloat(item.subtotal) || 0;

                  return (
                    <TableRow key={item.id || index}>
                      <TableCell
                        sx={{
                          py: 2,
                          textAlign: "center",
                        }}
                      >
                        {item.quantity || 0}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {item.product_name || "Product"}
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
                  <TableCell
                    sx={{
                      py: 2,
                      textAlign: "center",
                    }}
                  >
                    0
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>No items</TableCell>
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
                  <TableCell
                    sx={{
                      py: 1.5,
                      textAlign: "center",
                    }}
                  ></TableCell>
                  <TableCell sx={{ py: 1.5 }}></TableCell>
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
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Subtotal</Typography>
                <Typography variant="body2">${amount.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Sales Tax (5%)</Typography>
                <Typography variant="body2">${taxAmount.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body1" fontWeight="bold">
                  Total
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  ${totalAmount.toFixed(2)}
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
            Tel: +1 234 56 789
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Email: company@email.com
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Web: company.com
          </Typography>
        </Box>

        {/* Print notice */}
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontStyle="italic"
          >
            This is a computer-generated receipt. No signature is required.
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
