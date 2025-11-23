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
import { tokens } from "../../../theme";
import { useState } from "react";
import StockTableRow from "./StockTableRow";

const StocckTable = ({ productItems, stockItems, loading, onEdit }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // note: Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerpage, setRowsPerPage] = useState(5);

  // note: page change
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 5));
    setPage(0);
  };

  //  note: Calculate paginated data
  const paginatedItems = stockItems.slice(
    page * rowsPerpage,
    page * rowsPerpage + rowsPerpage
  );

  if (loading && stockItems.length === 0) {
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
            Loading stocks...
          </Typography>
        </Box>
      </>
    );
  }
  return (
    <>
      <Card>
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
                    <strong>Product Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Quantity</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Min Quantiy</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Unit</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((stock, index) => (
                  <StockTableRow
                    key={stockItems.id}
                    productItems={productItems}
                    // index={page * rowsPerpage + index + 1}
                    stock={stock}
                    onEdit={onEdit}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Table Pagination */}
          <TablePagination
            rowsPerPageOptions={[5]}
            component="div"
            count={stockItems.length}
            rowsPerPage={rowsPerpage}
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
          {stockItems.length === 0 && !loading && (
            <Box className="text-center p-4">
              <Typography variant="h6" color="text.secondary">
                No stocks found. Create your first category!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default StocckTable;
