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

const TranscationTableRow = ({
  index,
  transaction,
  onView, // ADD THIS
  onEdit,
  onDelete,
  loading,
}) => {
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
        <TableCell>
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
        </TableCell>
      </TableRow>
    </>
  );
};

export default TranscationTableRow;
