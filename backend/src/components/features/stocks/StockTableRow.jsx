import {
  TableRow,
  TableCell,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { Edit } from "@mui/icons-material";

const StockTableRow = ({ productItems, stock, onEdit, loading }) => {
  const product = productItems.find((item) => item.id === stock.product_id);
  return (
    <>
      <TableRow key={stock.id} hover>
        <TableCell>
          <Typography valign="boddy1" fontWeight="medium">
            {product ? product.name : "Unknown Product"}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography valign="boddy1" fontWeight="medium">
            {stock.quantity}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography valign="boddy1" fontWeight="medium">
            {stock.min_quantity}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography valign="boddy1" fontWeight="medium">
            {stock.unit}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Box
            display="flex"
            gap={1}
            justifyContent="flex-end" // Align icons to the right
            alignItems="center" // Vertically centered
            height="100%"
          >
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit(stock)}
              disabled={loading}
            >
              <Edit />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>
    </>
  );
};

export default StockTableRow;
