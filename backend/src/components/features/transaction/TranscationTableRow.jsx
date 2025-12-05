import {
  TableRow,
  TableCell,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { PictureAsPdf } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const TranscationTableRow = ({
  index,
  transaction,
  onView, // ADD THIS
  onEdit,
  onDelete,
  loading,
}) => {
  const navigate = useNavigate(); // Add this hook
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format amount with currency
  const formatAmount = (amount) => {
    if (!amount) return "-";
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  // Get chip color based on transaction type
  const getTypeColor = (type) => {
    return type === "in" ? "success" : "error";
  };

  // Get display text for transaction type
  const getTypeText = (type) => {
    return type === "in" ? "Stock In" : "Stock Out";
  };
  // Navigate to PDF page
  const handlePDFClick = () => {
    navigate(`/transactions/${transaction.id}/pdf`, {
      state: {
        transaction: transaction, // Pass the whole transaction object
        from: "transactions-page",
        timestamp: Date.now(),
      },
    });

    // OR if you want to open in NEW TAB:
    // window.open(`/transactions/${transaction.id}/pdf`, "_blank");
  };
  return (
    <>
      <TableRow key={transaction.id} hover>
        <TableCell>
          <Typography variant="body1" fontWeight={"medium"}>
            {index}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={getTypeText(transaction.transaction_type)}
            color={getTypeColor(transaction.transaction_type)}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Typography variant="body1" fontWeight={"medium"}>
            {transaction.product?.name || "N/A"}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography
            variant="body1"
            fontWeight="medium"
            color={
              transaction.transaction_type === "in"
                ? "success.main"
                : "error.main"
            }
          >
            {transaction.transaction_type === "in" ? "+" : "-"}
            {transaction.quantity}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body1" fontWeight="medium">
            {formatAmount(transaction.amount)}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body1" fontWeight="medium">
            {formatDate(transaction.transaction_date)}
          </Typography>
        </TableCell>
        {/* <TableCell>
          <Box display="flex" gap={1}>
            <Tooltip title="View Details">
              <IconButton
                color="primary"
                size="small"
                onClick={() => onView(transaction)} // <-- call your parent handler
              >
                <Visibility />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell> */}

        {/* Separate cell for PDF button - if you want it separate */}
        <TableCell>
          <Tooltip title="Export PDF">
            <IconButton
              size="small"
              onClick={handlePDFClick}
              sx={{
                color: "#e74c3c",
                "&:hover": { bgcolor: "rgba(231, 76, 60, 0.1)" },
              }}
            >
              <PictureAsPdf fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    </>
  );
};

export default TranscationTableRow;
