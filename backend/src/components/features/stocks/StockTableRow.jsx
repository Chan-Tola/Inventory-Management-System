import { TableRow, TableCell, Typography } from "@mui/material";

const StockTableRow = ({ productItems, stock }) => {
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
      </TableRow>
    </>
  );
};

export default StockTableRow;
