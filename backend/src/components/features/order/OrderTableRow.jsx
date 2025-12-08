import {
  TableRow,
  TableCell,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { PictureAsPdf } from "@mui/icons-material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../theme.js";

const OrderTableRow = ({ order, onView }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const formatAmount = (amount) => {
    if (!amount) return "-";
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return colors.greenAccent[500];
      case "pending":
        return colors.yellowAccent[500];
      case "processing":
        return colors.blueAccent[500];
      case "cancelled":
        return colors.redAccent[500];
      default:
        return colors.grey[300];
    }
  };

  // Navigate to PDF page
  const handlePDFClick = () => {
    navigate(`/orders/${order.id}/pdf`, {
      state: {
        order: order,
        from: "order-page",
        timestamp: Date.now(),
      },
    });
  };

  return (
    <TableRow
      key={order.id}
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
      {/* Order Code */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: colors.grey[100],
            fontFamily: "monospace",
            letterSpacing: "0.5px",
          }}
        >
          {order.order_code}
        </Typography>
      </TableCell>

      {/* Customer Name */}
      <TableCell sx={{ py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: colors.blueAccent[500],
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {order.customer_name?.charAt(0).toUpperCase() || "C"}
          </Avatar>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: colors.grey[100],
            }}
          >
            {order.customer_name}
          </Typography>
        </Box>
      </TableCell>

      {/* Order Item Count */}
      <TableCell sx={{ py: 2 }}>
        <Chip
          label={`${order.items?.length || 0} items`}
          size="small"
          sx={{
            bgcolor: colors.primary[500] + "30",
            color: colors.grey[100],
            fontWeight: 500,
            borderRadius: 1,
            px: 1,
          }}
        />
      </TableCell>

      {/* Status */}
      <TableCell sx={{ py: 2 }}>
        <Chip
          label={order.status}
          size="small"
          sx={{
            bgcolor: getStatusColor(order.status) + "20",
            color: getStatusColor(order.status),
            fontWeight: 600,
            borderRadius: 6,
            border: `1px solid ${getStatusColor(order.status)}30`,
            textTransform: "capitalize",
          }}
        />
      </TableCell>

      {/* Order Date */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: colors.grey[100],
            fontWeight: 500,
          }}
        >
          {formatDate(order.order_date)}
        </Typography>
      </TableCell>

      {/* Total Amount */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: colors.greenAccent[500],
            fontFamily: "monospace",
          }}
        >
          {formatAmount(order.total_amount)}
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

export default OrderTableRow;
