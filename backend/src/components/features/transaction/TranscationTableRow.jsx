import {
  TableRow,
  TableCell,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip,
  Avatar,
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { PictureAsPdf } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";
import { tokens } from "../../../theme.js";

const TranscationTableRow = ({
  index,
  transaction,
  onView,
  onEdit,
  onDelete,
  loading,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format amount with currency
  const formatAmount = (amount) => {
    if (!amount) return "-";
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  // Get type color
  const getTypeColor = (type) => {
    return type === "in" ? "success" : "error";
  };

  // Get display text for transaction type
  const getTypeText = (type) => {
    return type === "in" ? "Stock In" : "Stock Out";
  };

  // Get custom type colors from theme
  const getTypeCustomColor = (type) => {
    return type === "in" ? colors.greenAccent[500] : colors.redAccent[500];
  };

  // Get product color for avatar
  const getProductColor = (name) => {
    const colorsList = [
      colors.blueAccent[500],
      colors.greenAccent[500],
    ];
    const index = name?.length % colorsList.length || 0;
    return colorsList[index];
  };

  // Navigate to PDF page
  const handlePDFClick = () => {
    navigate(`/transactions/${transaction.id}/pdf`, {
      state: {
        transaction: transaction,
        from: "transactions-page",
        timestamp: Date.now(),
      },
    });
  };

  return (
    <TableRow
      key={transaction.id}
      hover
      sx={{
        borderBottom: `1px solid ${colors.primary[300]}20`,
        backgroundColor: "transparent",
        "&:hover": {
          backgroundColor: colors.primary[300] + "10",
        },
        transition: "background-color 0.2s ease",
      }}
    >
      {/* ID */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: colors.grey[300],
            fontFamily: "monospace",
          }}
        >
          {index}
        </Typography>
      </TableCell>

      {/* Type */}
      <TableCell sx={{ py: 2 }}>
        <Chip
          label={getTypeText(transaction.transaction_type)}
          size="small"
          sx={{
            bgcolor: getTypeCustomColor(transaction.transaction_type) + "20",
            color: getTypeCustomColor(transaction.transaction_type),
            fontWeight: 600,
            borderRadius: 6,
            border: `1px solid ${getTypeCustomColor(
              transaction.transaction_type
            )}30`,
          }}
        />
      </TableCell>

      {/* Product */}
      <TableCell sx={{ py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: colors.grey[100],
            }}
          >
            {transaction.product?.name || "N/A"}
          </Typography>
        </Box>
      </TableCell>

      {/* Quantity */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color:
              transaction.transaction_type === "in"
                ? colors.greenAccent[500]
                : colors.redAccent[500],
            fontFamily: "monospace",
            letterSpacing: "0.5px",
          }}
        >
          {transaction.transaction_type === "in" ? "+" : "-"}
          {transaction.quantity}
        </Typography>
      </TableCell>

      {/* Amount */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: colors.grey[100],
            fontFamily: "monospace",
          }}
        >
          {formatAmount(transaction.amount)}
        </Typography>
      </TableCell>

      {/* Date */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: colors.grey[300],
          }}
        >
          {formatDate(transaction.transaction_date)}
        </Typography>
      </TableCell>

      {/* PDF Button */}
      <TableCell sx={{ py: 2 }}>
        <Tooltip title="Export PDF">
          <IconButton
            size="small"
            onClick={handlePDFClick}
            sx={{
              backgroundColor: colors.redAccent[500] + "15",
              color: colors.redAccent[500],
              "&:hover": {
                backgroundColor: colors.redAccent[500] + "25",
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease",
              borderRadius: 2,
              width: 36,
              height: 36,
            }}
          >
            <PictureAsPdf fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default TranscationTableRow;
