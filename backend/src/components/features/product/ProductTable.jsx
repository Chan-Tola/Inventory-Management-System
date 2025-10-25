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
import ProductTableRow from "./ProductTableRow";
import { useState } from "react";

const ProductTable = ({ productItems, loading, onEdit, onDelete, onLink }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // note: Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // note: page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 5));
    setPage(0);
  };
  // Calculate paginated data
  const paginatedItems = productItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && productItems.length === 0) {
    return (
      <>
        <Box className="flex justify-center items-center p-4">
          <CircularProgress
            sx={{
              color: theme.palette.primary.main,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                ml: 2,
                color: theme.palette.text.primary,
              }}
            >
              Loading products...
            </Typography>
          </CircularProgress>
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
                    <strong>Image</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Product Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Category Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Sku</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Brand</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Price</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((product, index) => (
                  <ProductTableRow
                    key={product.id}
                    index={page * rowsPerPage + index + 1} // Calculate global index
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onLink={onLink}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Table Pagination */}
          <TablePagination
            rowsPerPageOptions={[5]}
            component="div"
            count={productItems.length}
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
          {productItems.length === 0 && !loading && (
            <Box className="text-center p-4">
              <Typography variant="h6" color="text.secondary">
                No Products found. Create your first category!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ProductTable;
