import {
  TableRow,
  TableCell,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { useCustomer } from "../../../hooks/useCustomer";

const OrderTableRow = ({ order, onView }) => {
  const { customerItems } = useCustomer();

  const formatAmount = (amount) => {
    if (!amount) return "-";
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // ✅ Correct: get name from nested "customer" object
  const getCustomerName = (id) => {
    const customerObj = customerItems.find((c) => c.customer?.id === id);
    return customerObj ? customerObj.name : "Unknown Customer";
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
          {getCustomerName(order.customer_id)}
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
      <TableCell>
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
      </TableCell>
    </TableRow>
  );
};

export default OrderTableRow;
