import {
  TableRow,
  TableCell,
  Typography,
  Chip,
  Box,
  LinearProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const StockTableRow = ({ stock }) => {
  const theme = useTheme();

  const getStockStatus = () => {
    if (stock.quantity === 0) {
      return {
        severity: "error",
        label: "Out of Stock",
        color: "error",
        progress: 0,
      };
    } else if (stock.quantity <= stock.min_quantity) {
      const progress = (stock.quantity / stock.min_quantity) * 100;
      return {
        severity: "warning",
        label: "Low Stock",
        color: "warning",
        progress,
      };
    } else {
      const progress = Math.min(
        (stock.quantity / (stock.min_quantity * 2)) * 100,
        100
      );
      return {
        severity: "success",
        label: "In Stock",
        color: "success",
        progress,
      };
    }
  };

  const getQuantityColor = () => {
    if (stock.quantity === 0) return "error.main";
    if (stock.quantity <= stock.min_quantity) return "warning.main";
    return "success.main";
  };

  const status = getStockStatus();
  const needsRestock = stock.quantity <= stock.min_quantity;

  return (
    <TableRow
      hover
      sx={{
        backgroundColor: needsRestock
          ? theme.palette.error.dark + "50"
          : "inherit",
        "&:hover": {
          backgroundColor: needsRestock
            ? theme.palette.error.light + "25"
            : theme.palette.action.hover,
        },
      }}
    >
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body1" fontWeight="medium">
            {stock.product?.name}
          </Typography>
        </Box>
      </TableCell>

      <TableCell>
        <Typography
          variant="body1"
          fontWeight="bold"
          color={getQuantityColor()}
        >
          {stock.quantity}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body1" fontWeight="medium">
          {stock.min_quantity}
        </Typography>
      </TableCell>

      <TableCell>
        <Box sx={{ minWidth: 100 }}>
          <Chip
            label={status.label}
            color={status.color}
            size="small"
            variant={needsRestock ? "filled" : "outlined"}
          />
          <LinearProgress
            variant="determinate"
            value={status.progress}
            color={status.color}
            sx={{
              mt: 1,
              height: 6,
              borderRadius: 3,
            }}
          />
        </Box>
      </TableCell>

      <TableCell>
        <Typography variant="body1" fontWeight="medium">
          {stock.unit}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

export default StockTableRow;
