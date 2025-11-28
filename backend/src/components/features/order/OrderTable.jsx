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
} from "@mui/material";
import { tokens } from "../../../theme.js";
import { useState } from "react";
import OrderTableRow from "./OrderTableRow.jsx";

const OrderTable = ({
  orderItems, // ✅ CHANGED: from supplierItems
  loading,
  onView, // ADD THIS
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // note: Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // note: page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // note: page funtion change row per page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // ✅ FIXED: changed 5 to 10
    setPage(0);
  };

  // note: Calculate paginated data
  const paginatedItems = orderItems.slice(
    // ✅ CHANGED: from supplierItems
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && orderItems.length === 0) {
    // ✅ CHANGED: from supplierItems
    return (
      <>
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
            Loading orders...
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Card
        sx={{
          background: `${colors.primary[400]}`,
        }}
      >
        <CardContent>
          <TableContainer component={Paper}>
            <Table
              sx={{
                background: `${colors.primary[400]}`,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Order Code</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Customer Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Order Items</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Order Date</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Total Amount</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map(
                  (
                    order,
                    index // ✅ CHANGED: from supplier
                  ) => (
                    <OrderTableRow
                      key={order.id}
                      index={page * rowsPerPage + index + 1} // Calculate global index
                      order={order} // ✅ CHANGED: from supplier
                      onView={onView} // ADD THIS
                    />
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Table Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]} // ✅ IMPROVED: Added more options
            component="div"
            count={orderItems.length} // ✅ CHANGED: from supplierItems
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              background: `${colors.primary[400]}`,
              color: theme.palette.text.primary,
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  color: theme.palette.text.primary,
                },
            }}
          />

          {orderItems.length === 0 &&
            !loading && ( // ✅ CHANGED: from supplierItems
              <Box className="text-center p-4">
                <Typography variant="h6" color="text.secondary">
                  No orders found.
                </Typography>
              </Box>
            )}
        </CardContent>
      </Card>
    </>
  );
};

export default OrderTable;
