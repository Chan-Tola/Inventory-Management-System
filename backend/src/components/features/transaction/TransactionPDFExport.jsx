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

const TransactionPDFExport = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [transaction, setTransaction] = useState(
    location.state?.transaction || null
  );
  const [loading, setLoading] = useState(!location.state?.transaction);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  useEffect(() => {
    if (location.state?.transaction) {
      setTransaction(location.state.transaction);
      setLoading(false);
    }
  }, [transactionId, location.state]);

  useEffect(() => {
    if (transaction && !loading && !pdfGenerated) {
      generatePDF();
      setPdfGenerated(true);
    }
  }, [transaction, loading, pdfGenerated]);

  console.log(transaction);

  const generatePDF = () => {
    if (!transaction) return;

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Parse amount to number
    const unitPrice = parseFloat(transaction.amount) || 0;
    const quantity = parseInt(transaction.quantity) || 0;
    const totalAmount = unitPrice * quantity;
    const transactionType =
      transaction.transaction_type === "in" ? "Stock In" : "Stock Out";
    const moneyType =
      transaction.money_type === "expense" ? "Expense" : "Income";

    // === FROM SECTION (STAFF/COMPANY INFO) ===
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("FROM", 20, yPos);
    if (transaction.supplier) {
      // For Stock In transactions (has supplier)
      doc.text(
        `Supplier: ${transaction.supplier.name || "Unknown"}`,
        20,
        yPos + 6
      );
      doc.text(
        `Address: ${transaction.supplier.address || "N/A"}`,
        20,
        yPos + 12
      );
    } else {
      doc.text("Inventory Management System", 20, yPos + 6);
      doc.text("Sen Sok, Phnom Pnom Penh", 20, yPos + 12);
    }

    yPos += 25;

    // === TO SECTION (SUPPLIER/CUSTOMER INFO) ===
    doc.setFont("helvetica", "bold");
    doc.text("TO", 20, yPos);
    doc.setFont("helvetica", "normal");

    if (transaction.supplier) {
      // For Stock In transactions (has supplier)
      doc.text("Inventory Management System", 20, yPos + 6);
      doc.text("Sen Sok, Phnom Pnom Penh", 20, yPos + 12);
    } else {
      // For Stock Out transactions (no supplier)
      doc.text("Customer", 20, yPos + 6);
    }

    yPos += 25;

    // === RECEIPT HEADER (Right side) ===
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("TRANSACTION RECEIPT", pageWidth - 20, yPos - 15, {
      align: "right",
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Transaction #: ${transaction.id}`, pageWidth - 20, yPos - 9, {
      align: "right",
    });
    doc.text(
      `Date: ${new Date(transaction.transaction_date).toLocaleDateString(
        "en-US"
      )}`,
      pageWidth - 20,
      yPos - 3,
      { align: "right" }
    );

    // Transaction Type Display
    doc.text(`Type: ${transactionType}`, pageWidth - 20, yPos + 3, {
      align: "right",
    });

    // Notes/Reference
    if (transaction.notes) {
      doc.text(`Notes: ${transaction.notes}`, pageWidth - 20, yPos + 9, {
        align: "right",
      });
    }

    yPos += 30;

    // === TRANSACTION DETAILS SECTION ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("TRANSACTION DETAILS", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    yPos += 8;

    // Draw details box
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1);
    const detailsBoxHeight = 30;

    // Left column details
    doc.text(`Product: ${transaction.product?.name || "N/A"}`, 25, yPos + 6);
    doc.text(`Quantity: ${quantity}`, 25, yPos + 12);
    doc.text(`Transaction Type: ${transactionType}`, 25, yPos + 18);

    // Right column details
    doc.text(`Money Type: ${moneyType}`, 120, yPos + 6);
    doc.text(
      `Money Impact: $${transaction.money_impact?.toFixed(2) || "0.00"}`,
      120,
      yPos + 12
    );
    doc.text(`Stock Impact: ${transaction.stock_impact || 0}`, 120, yPos + 18);

    yPos += detailsBoxHeight;

    // === PRICE BREAKDOWN TABLE ===
    // Draw table header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255); // White text
    doc.setFillColor(0, 0, 0); // Black background

    // Header cells
    doc.rect(20, yPos, 90, 8, "F"); // Description
    doc.rect(110, yPos, 30, 8, "F"); // Quantity
    doc.rect(140, yPos, 30, 8, "F"); // Unit Price
    doc.rect(170, yPos, 25, 8, "F"); // Amount

    // Header text
    doc.text("Product Name", 20 + 45, yPos + 5, { align: "center" });
    doc.text("QTY", 110 + 15, yPos + 5, { align: "center" });
    doc.text("Unit Price", 140 + 15, yPos + 5, { align: "center" });
    doc.text("Amount", 170 + 12.5, yPos + 5, { align: "center" });

    yPos += 8;

    // Reset text color for content
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    // Main item row
    const productName = transaction.product?.name || "Product";
    doc.text(productName, 20 + 5, yPos + 5, { maxWidth: 80 });
    doc.text(quantity.toString(), 110 + 15, yPos + 5, { align: "center" });
    doc.text(`$${unitPrice.toFixed(2)}`, 140 + 15, yPos + 5, {
      align: "right",
    });
    doc.text(`$${totalAmount.toFixed(2)}`, 170 + 20, yPos + 5, {
      align: "right",
    });

    yPos += 7;

    // Add empty rows to reach 7 total rows
    for (let i = 0; i < 6; i++) {
      yPos += 7;
    }

    // Draw grid lines
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1);

    // Calculate table height
    const tableHeight = 8 + 7 * 7; // Header + 7 rows * 7mm each

    // Vertical lines
    doc.line(20, yPos - tableHeight + 8, 20, yPos + 7); // Left border
    doc.line(110, yPos - tableHeight + 8, 110, yPos + 7); // Between Description and Quantity
    doc.line(140, yPos - tableHeight + 8, 140, yPos + 7); // Between Quantity and Unit Price
    doc.line(170, yPos - tableHeight + 8, 170, yPos + 7); // Between Unit Price and Amount
    doc.line(195, yPos - tableHeight + 8, 195, yPos + 7); // Right border

    // Horizontal lines
    const tableTopY = yPos - tableHeight + 8;
    doc.line(20, tableTopY, 195, tableTopY); // Top line
    for (let i = 0; i <= 7; i++) {
      doc.line(20, tableTopY + i * 7, 195, tableTopY + i * 7);
    }

    // === SUMMARY SECTION ===
    yPos += 20;

    // Unit Price
    doc.setFontSize(10);
    doc.text("Unit Price", pageWidth - 100, yPos);
    doc.text(`$${unitPrice.toFixed(2)}`, pageWidth - 20, yPos, {
      align: "right",
    });

    // Quantity
    doc.text("Quantity", pageWidth - 100, yPos + 8);
    doc.text(quantity.toString(), pageWidth - 20, yPos + 8, {
      align: "right",
    });

    // Total Amount
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount", pageWidth - 100, yPos + 18);
    doc.text(`$${totalAmount.toFixed(2)}`, pageWidth - 20, yPos + 18, {
      align: "right",
    });

    // Money Impact (shows if money was added or subtracted)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const impactLabel =
      transaction.money_impact >= 0 ? "Money Added" : "Money Deducted";
    const impactColor =
      transaction.money_impact >= 0 ? [0, 128, 0] : [200, 0, 0];
    doc.setTextColor(...impactColor);
    doc.text(impactLabel, pageWidth - 100, yPos + 28);
    doc.text(
      `$${Math.abs(transaction.money_impact || 0).toFixed(2)}`,
      pageWidth - 20,
      yPos + 28,
      {
        align: "right",
      }
    );

    // Reset text color
    doc.setTextColor(0, 0, 0);

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
    const fileName = `transaction-${transaction.id}-${transactionType
      .toLowerCase()
      .replace(" ", "-")}.pdf`;
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

  if (!transaction) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: 4, minHeight: "100vh", bgcolor: "background.default" }}
      >
        <Alert severity="error" sx={{ mb: 3 }}>
          Transaction not found. Please go back and try again.
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          variant="outlined"
        >
          Back to Transactions
        </Button>
      </Container>
    );
  }

  // Parse values to numbers
  const unitPrice = parseFloat(transaction.amount) || 0;
  const quantity = parseInt(transaction.quantity) || 0;
  const totalAmount = unitPrice * quantity;
  const transactionType =
    transaction.transaction_type_display ||
    (transaction.transaction_type === "in" ? "Stock In" : "Stock Out");
  const moneyType = transaction.money_type === "expense" ? "Expense" : "Income";

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
              Transaction #{transaction.id} - {transactionType}
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

      {/* Transaction Content */}
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
        {/* FROM section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="caption" fontWeight="bold" gutterBottom>
            From
          </Typography>
          {transaction.supplier ? (
            <>
              <Typography variant="body1" fontWeight="medium">
                {transaction.supplier.name || "Unknown"}
              </Typography>
              <Typography variant="body2">
                {transaction.supplier.address || "N/A"}
              </Typography>
            </>
          ) : (
            <Box>
              <Typography variant="body1" fontWeight="medium">
                Invnetory Managment System
              </Typography>
              <Typography variant="body2">Sen Sok, Phnom Pnom Penh</Typography>
            </Box>
          )}
        </Box>

        {/* TO section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="caption" fontWeight="bold" gutterBottom>
            TO
          </Typography>
          {transaction.supplier ? (
            <>
              <Typography variant="body1" fontWeight="medium">
                Invnetory Managment System
              </Typography>
              <Typography variant="body2">Sen Sok, Phnom Pnom Penh</Typography>
            </>
          ) : (
            <Typography variant="body1" fontWeight="medium">
              Customer
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Transaction Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              TRANSACTION RECEIPT
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2">
              Transaction #: {transaction.id}
            </Typography>
            <Typography variant="body2">
              Date:
              {new Date(transaction.transaction_date).toLocaleDateString(
                "en-US"
              )}
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              Type: {transactionType}
            </Typography>
            {transaction.notes && (
              <Typography variant="caption" color="text.secondary">
                Notes: {transaction.notes}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Transaction Details */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.default",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            TRANSACTION DETAILS
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            <Box>
              <Typography variant="body2">
                <strong>Product:</strong> {transaction.product?.name || "N/A"}
              </Typography>
              <Typography variant="body2">
                <strong>Quantity:</strong> {quantity}
              </Typography>
              <Typography variant="body2">
                <strong>Transaction Type:</strong> {transactionType}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2">
                <strong>Money Type:</strong> {moneyType}
              </Typography>
              <Typography variant="body2">
                <strong>Money Impact:</strong> $
                {transaction.money_impact?.toFixed(2) || "0.00"}
              </Typography>
              <Typography variant="body2">
                <strong>Stock Impact:</strong> {transaction.stock_impact || 0}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Price Breakdown Table */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            mb: 4,
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
                  Description
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
                  QTY
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
              {/* Main Item Row */}
              <TableRow>
                <TableCell sx={{ py: 2 }}>
                  {transaction.product?.name || "Product"}
                </TableCell>
                <TableCell
                  sx={{
                    py: 2,
                    textAlign: "center",
                  }}
                >
                  {quantity}
                </TableCell>
                <TableCell sx={{ py: 2 }} align="right">
                  ${unitPrice.toFixed(2)}
                </TableCell>
                <TableCell sx={{ py: 2 }} align="right">
                  ${totalAmount.toFixed(2)}
                </TableCell>
              </TableRow>

              {/* Empty Rows to match PDF format */}
              {[...Array(6)].map((_, index) => (
                <TableRow key={index}>
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

        {/* Summary Section */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
          <Box sx={{ width: 300 }}>
            <Stack spacing={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Unit Price</Typography>
                <Typography variant="body2">${unitPrice.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Quantity</Typography>
                <Typography variant="body2">{quantity}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body1" fontWeight="bold">
                  Total Amount
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  ${totalAmount.toFixed(2)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  color:
                    transaction.money_impact >= 0
                      ? "success.main"
                      : "error.main",
                }}
              >
                <Typography variant="body2">
                  {transaction.money_impact >= 0
                    ? "Money Added"
                    : "Money Deducted"}
                </Typography>
                <Typography variant="body2">
                  ${Math.abs(transaction.money_impact || 0).toFixed(2)}
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

export default TransactionPDFExport;
