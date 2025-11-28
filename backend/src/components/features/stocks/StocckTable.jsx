import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  CircularProgress,
  useTheme,
  TablePagination,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import { tokens } from "../../../theme";
import { useState } from "react";
import StockTableRow from "./StockTableRow";
import AddIcon from "@mui/icons-material/Add";

const StockTable = ({
  productItems,
  stockItems,
  loading,
  onEdit,
  onAddStock,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerpage, setRowsPerPage] = useState(5);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate paginated data
  const paginatedItems = stockItems.slice(
    page * rowsPerpage,
    page * rowsPerpage + rowsPerpage
  );

  // Calculate low stock items
  const lowStockItems = stockItems.filter(
    (stock) => stock.quantity <= stock.min_quantity
  );
  const criticalStockItems = stockItems.filter((stock) => stock.quantity === 0);

  if (loading && stockItems.length === 0) {
    return (
      <Box className="flex justify-center item-center p-4">
        <CircularProgress
          sx={{
            color: theme.palette.primary.main,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            ml: 2,
            color: theme.palette.text.primary,
          }}
        >
          Loading stocks...
        </Typography>
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Stock Status Alerts */}
        {criticalStockItems.length > 0 && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Tooltip title="Add stock to critical items">
                <IconButton
                  size="small"
                  onClick={() => onAddStock && onAddStock(criticalStockItems)}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            }
          >
            {criticalStockItems.length} product(s) are out of stock!
          </Alert>
        )}

        {lowStockItems.length > 0 && criticalStockItems.length === 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {lowStockItems.length} product(s) are running low on stock!
          </Alert>
        )}

        <TableContainer
          component={Paper}
          sx={{
            border: `1px solid ${colors.primary[300]}`,
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: colors.primary[400] }}>
                <TableCell>
                  <strong>Product Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Current Quantity</strong>
                </TableCell>
                <TableCell>
                  <strong>Min Quantity</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell>
                  <strong>Unit</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedItems.map((stock) => (
                <StockTableRow
                  key={stock?.id || `stock-${index}`}
                  stock={stock}
                  onEdit={onEdit}
                  onAddStock={onAddStock}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Table Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={stockItems.length}
          rowsPerPage={rowsPerpage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            backgroundColor: colors.primary[400],
            color: theme.palette.text.primary,
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                color: theme.palette.text.primary,
              },
            "& .MuiSvgIcon-root": {
              color: theme.palette.text.primary,
            },
          }}
        />

        {stockItems.length === 0 && !loading && (
          <Box className="text-center p-4">
            <Typography variant="h6" color="text.secondary">
              No stocks found. Add your first product!
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StockTable;
