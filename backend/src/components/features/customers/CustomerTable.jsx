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
import CustomerTableRow from "./CustomerTableRow.jsx";
import { useState } from "react";

const CustomerTable = ({ customerItems, loading, onEdit, onDelete }) => {
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
    setRowsPerPage(parseInt(event.target.value, 5));
    setPage(0);
  };

  // note: Calculate paginated data
  const paginatedItems = customerItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && customerItems.length === 0) {
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
            Loading customers ...
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
                    <strong>Customer Code</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Gender</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Address</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((customerInfor, index) => (
                  <CustomerTableRow
                    key={customerInfor.id}
                    index={page * rowsPerPage + index + 1} // Calculate global index
                    customerInfor={customerInfor}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Table Pagination */}
          <TablePagination
            rowsPerPageOptions={[5]}
            component="div"
            count={customerItems.length}
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
          {customerItems.length === 0 && !loading && (
            <Box className="text-center p-4">
              <Typography variant="h6" color="text.secondary">
                No suppliers found. Create your first supplier!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </>
  );
};
export default CustomerTable;
