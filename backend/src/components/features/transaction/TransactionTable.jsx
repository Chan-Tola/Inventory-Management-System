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
import TranscationTableRow from "./TranscationTableRow.jsx";
import { useState } from "react";

const TransactionTable = ({
  transactionItems, // ✅ CHANGED: from supplierItems
  loading,
  onEdit,
  onDelete,
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
  const paginatedItems = transactionItems.slice(
    // ✅ CHANGED: from supplierItems
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && transactionItems.length === 0) {
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
            Loading transactions...
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
                    <strong>ID</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Type</strong> {/* ✅ CHANGED: from Name */}
                  </TableCell>
                  <TableCell>
                    <strong>Product</strong> {/* ✅ CHANGED: from Contacts */}
                  </TableCell>
                  <TableCell>
                    <strong>Quantity</strong> {/* ✅ CHANGED: from Address */}
                  </TableCell>
                  <TableCell>
                    <strong>Amount</strong> {/* ✅ ADDED: New column */}
                  </TableCell>
                  <TableCell>
                    <strong>Date</strong> {/* ✅ ADDED: New column */}
                  </TableCell>
                  <TableCell>
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map(
                  (
                    transaction,
                    index // ✅ CHANGED: from supplier
                  ) => (
                    <TranscationTableRow
                      key={transaction.id}
                      index={page * rowsPerPage + index + 1} // Calculate global index
                      transaction={transaction} // ✅ CHANGED: from supplier
                      onEdit={onEdit}
                      onDelete={onDelete}
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
            count={transactionItems.length} // ✅ CHANGED: from supplierItems
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

          {transactionItems.length === 0 &&
            !loading && ( // ✅ CHANGED: from supplierItems
              <Box className="text-center p-4">
                <Typography variant="h6" color="text.secondary">
                  No transactions found. {/* ✅ CHANGED: message */}
                </Typography>
              </Box>
            )}
        </CardContent>
      </Card>
    </>
  );
};

export default TransactionTable;
