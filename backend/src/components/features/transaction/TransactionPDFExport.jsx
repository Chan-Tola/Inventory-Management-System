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

  const generatePDF = () => {
    if (!transaction) return;

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Parse amount to number
    const amount = parseFloat(transaction.amount) || 0;
    const quantity = parseInt(transaction.quantity) || 0;

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
    doc.text(`Receipt #: ${transaction.id}`, pageWidth - 20, yPos + 15, {
      align: "right",
    });
    doc.text(
      `Receipt Date: ${new Date().toLocaleDateString("en-US")}`,
      pageWidth - 20,
      yPos + 21,
      { align: "right" }
    );

    yPos += 40;

    // Customer Info (To)
    doc.setFont("helvetica", "bold");
    doc.text("TO", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(transaction.supplier?.name || "Customer Name", 20, yPos + 6);
    doc.text(
      transaction.supplier?.address || "Customer Address 1234",
      20,
      yPos + 12
    );
    doc.text("CA 12345", 20, yPos + 18);

    yPos += 40;

    // Items Table - MANUAL IMPLEMENTATION (no autoTable)
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

    // Main row
    doc.text(quantity.toString(), 20 + 7.5, yPos + 5, { align: "center" });
    doc.text(transaction.product?.name || "Product", 35 + 5, yPos + 5);
    doc.text(`$${(amount / quantity || 0).toFixed(2)}`, 115 + 20, yPos + 5, {
      align: "right",
    });
    doc.text(`$${amount.toFixed(2)}`, 155 + 20, yPos + 5, { align: "right" });

    yPos += 7;

    // Empty rows (6 rows as in the image)
    for (let i = 0; i < 6; i++) {
      doc.text("", 20, yPos + 5);
      doc.text("", 35, yPos + 5);
      doc.text("", 115, yPos + 5);
      doc.text("", 155, yPos + 5);
      yPos += 7;
    }

    // Draw grid lines
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1);

    // Vertical lines
    doc.line(20, yPos - 42, 20, yPos + 7);
    doc.line(35, yPos - 42, 35, yPos + 7);
    doc.line(115, yPos - 42, 115, yPos + 7);
    doc.line(155, yPos - 42, 155, yPos + 7);
    doc.line(195, yPos - 42, 195, yPos + 7);

    // Horizontal lines
    doc.line(20, yPos - 42, 195, yPos - 42); // Top line
    for (let i = 0; i <= 7; i++) {
      doc.line(20, yPos - 42 + i * 7, 195, yPos - 42 + i * 7);
    }

    // Totals Section
    yPos += 15;

    // Subtotal
    doc.setFontSize(10);
    doc.text("Subtotal", pageWidth - 100, yPos);
    doc.text(`$${amount.toFixed(2)}`, pageWidth - 20, yPos, { align: "right" });

    // Tax
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
    doc.save(`receipt-${transaction.id}.pdf`);
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
  const amount = parseFloat(transaction.amount) || 0;
  const quantity = parseInt(transaction.quantity) || 0;
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
              Receipt #{transaction.id}
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
        {/* TO section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="caption" fontWeight="bold" gutterBottom>
            FROM
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {transaction.supplier?.name || "STAF ID: " + transaction.staff_id}
          </Typography>
          <Typography variant="body2">
            {transaction.supplier?.address || ""}
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
                  Product Name
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
                <TableCell
                  sx={{
                    py: 2,
                    textAlign: "center",
                  }}
                >
                  {quantity}
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  {transaction.product?.name || "Product"}
                </TableCell>
                <TableCell sx={{ py: 2 }} align="right">
                  ${amount.toFixed(2)}
                </TableCell>
                <TableCell sx={{ py: 2 }} align="right">
                  ${(amount * quantity || 0).toFixed(2)}
                </TableCell>
              </TableRow>

              {/* Empty Rows to match PDF format (6 rows) */}
              {[...Array(6)].map((_, index) => (
                <TableRow key={index}>
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
            Tel: +855 16 354 159
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Email: chantola.ren@email.com
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
