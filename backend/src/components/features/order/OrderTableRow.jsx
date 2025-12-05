import {
  TableRow,
  TableCell,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { PictureAsPdf } from "@mui/icons-material";
// import { useCustomer } from "../../../hooks/useCustomer";

const OrderTableRow = ({ order, onView }) => {
  // const { customerItems } = useCustomer();
  const navigate = useNavigate();
  const formatAmount = (amount) => {
    if (!amount) return "-";
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // // ✅ Correct: get name from nested "customer" object
  // const getCustomerName = (id) => {
  //   const customerObj = customerItems.find((c) => c.customer?.id === id);
  //   return customerObj ? customerObj.name : "Unknown Customer";
  // };
  // Navigate to PDF page
  const handlePDFClick = () => {
    navigate(`/orders/${order.id}/pdf`, {
      state: {
        order: order, // Pass the whole transaction object
        from: "order-page",
        timestamp: Date.now(),
      },
    });

    // OR if you want to open in NEW TAB:
    // window.open(`/transactions/${transaction.id}/pdf`, "_blank");
  };

  return (
    <TableRow key={order.id} hover>
      {/* order code */}
      <TableCell>
        <Typography variant="body1" fontWeight="medium">
          {order.order_code}
        </Typography>
      </TableCell>

      {/* customer name */}
      <TableCell>
        <Typography variant="body1" fontWeight="medium">
          {order.customer_name}
        </Typography>
      </TableCell>

      {/* order item count */}
      <TableCell>
        <Typography variant="body1" fontWeight="medium">
          {order.items.length}
        </Typography>
      </TableCell>

      {/* status */}
      <TableCell>
        <Typography variant="body1" fontWeight="medium">
          {order.status}
        </Typography>
      </TableCell>

      {/* order date */}
      <TableCell>
        <Typography variant="body1" fontWeight="medium">
          {formatDate(order.order_date)}
        </Typography>
      </TableCell>

      {/* total */}
      <TableCell>
        <Typography variant="body1" fontWeight="medium">
          {formatAmount(order.total_amount)}
        </Typography>
      </TableCell>

      {/* View button */}
      {/* <TableCell>
        <Box display="flex" gap={1}>
          <Tooltip title="View Details">
            <IconButton
              color="primary"
              size="small"
              onClick={() => onView(order)}
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
  );
};

export default OrderTableRow;
