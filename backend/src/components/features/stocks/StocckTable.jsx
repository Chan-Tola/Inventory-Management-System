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
  Skeleton,
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

  // Skeleton loading state
  if (loading && stockItems.length === 0) {
    return (
      <Card
        sx={{
          background: `${colors.primary[400]}`,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <CardContent>
          {/* Alert Skeletons */}
          <Box sx={{ mb: 2 }}>
            <Skeleton
              variant="rounded"
              width="100%"
              height={56}
              sx={{
                bgcolor: colors.primary[500],
                borderRadius: 1,
              }}
            />
          </Box>

          {/* Table Header Skeleton */}
          <TableContainer
            component={Paper}
            sx={{
              border: `1px solid ${colors.primary[300]}`,
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: colors.primary[400] }}>
                  {[
                    "Product Name",
                    "Current Quantity",
                    "Min Quantity",
                    "Status",
                    "Unit",
                  ].map((header) => (
                    <TableCell key={header}>
                      <Skeleton
                        variant="text"
                        width={header === "Product Name" ? "80%" : "70%"}
                        height={30}
                        sx={{
                          bgcolor: colors.primary[500],
                          mx: "auto",
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Skeleton Rows */}
                {Array.from({ length: rowsPerpage }).map((_, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    sx={{
                      backgroundColor:
                        rowIndex % 2 === 0
                          ? "transparent"
                          : colors.primary[300] + "30",
                    }}
                  >
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Skeleton
                          variant="circular"
                          width={32}
                          height={32}
                          sx={{ bgcolor: colors.primary[500] }}
                        />
                        <Skeleton
                          variant="text"
                          width={120}
                          height={24}
                          sx={{ bgcolor: colors.primary[500] }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        variant="text"
                        width={60}
                        height={24}
                        sx={{ bgcolor: colors.primary[500] }}
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        variant="text"
                        width={50}
                        height={24}
                        sx={{ bgcolor: colors.primary[500] }}
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        variant="rounded"
                        width={80}
                        height={32}
                        sx={{
                          bgcolor: colors.primary[500],
                          borderRadius: 2,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        variant="text"
                        width={40}
                        height={24}
                        sx={{ bgcolor: colors.primary[500] }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Skeleton */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Skeleton
              variant="text"
              width={200}
              height={40}
              sx={{ bgcolor: colors.primary[500] }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              {[1, 2, 3].map((item) => (
                <Skeleton
                  key={item}
                  variant="rounded"
                  width={40}
                  height={32}
                  sx={{
                    bgcolor: colors.primary[500],
                    borderRadius: 1,
                  }}
                />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
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
