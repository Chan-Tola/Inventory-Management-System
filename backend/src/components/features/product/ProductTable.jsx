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
  Skeleton,
} from "@mui/material";
import { tokens } from "../../../theme";
import ProductTableRow from "./ProductTableRow";
import { useState } from "react";

const ProductTable = ({ productItems, loading, onEdit, onDelete }) => {
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

  // note: Calculate paginated data
  const paginatedItems = productItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Skeleton loading state
  if (loading && productItems.length === 0) {
    return (
      <Card
        sx={{
          background: `${colors.primary[400]}`,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <CardContent>
          {/* Table Header Skeleton */}
          <TableContainer component={Paper}>
            <Table
              sx={{
                background: `${colors.primary[400]}`,
              }}
            >
              <TableHead>
                <TableRow>
                  {[
                    "ID",
                    "Image",
                    "Product Name",
                    "Category Name",
                    "Sku",
                    "Brand",
                    "Price",
                    "Actions",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      align={header === "Actions" ? "right" : "left"}
                    >
                      <Skeleton
                        variant="text"
                        width={
                          header === "Product Name" ||
                          header === "Category Name"
                            ? "80%"
                            : header === "Actions"
                            ? "70%"
                            : header === "Image"
                            ? "60%"
                            : "70%"
                        }
                        height={30}
                        sx={{
                          bgcolor: colors.primary[500],
                          mx: header === "Actions" ? "0" : "auto",
                          ml: header === "Actions" ? "auto" : "0",
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Skeleton Rows */}
                {Array.from({ length: rowsPerPage }).map((_, rowIndex) => (
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
                      <Skeleton
                        variant="rounded"
                        width={40}
                        height={32}
                        sx={{
                          bgcolor: colors.primary[500],
                          borderRadius: 1,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        variant="circular"
                        width={40}
                        height={40}
                        sx={{ bgcolor: colors.primary[500] }}
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        variant="text"
                        width={120}
                        height={24}
                        sx={{ bgcolor: colors.primary[500] }}
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        variant="rounded"
                        width={100}
                        height={32}
                        sx={{
                          bgcolor: colors.primary[500],
                          borderRadius: 2,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        variant="rounded"
                        width={80}
                        height={32}
                        sx={{
                          bgcolor: colors.primary[500],
                          borderRadius: 1,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        variant="text"
                        width={80}
                        height={24}
                        sx={{ bgcolor: colors.primary[500] }}
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        variant="text"
                        width={70}
                        height={24}
                        sx={{ bgcolor: colors.primary[500] }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 1,
                        }}
                      >
                        <Skeleton
                          variant="rounded"
                          width={70}
                          height={32}
                          sx={{
                            bgcolor: colors.primary[500],
                            borderRadius: 2,
                          }}
                        />
                        <Skeleton
                          variant="rounded"
                          width={70}
                          height={32}
                          sx={{
                            bgcolor: colors.primary[500],
                            borderRadius: 2,
                          }}
                        />
                      </Box>
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

          {/* Loading Indicator */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 3,
              mt: 2,
              borderTop: 1,
              borderColor: colors.primary[300] + "50",
            }}
          >
            <CircularProgress
              size={20}
              sx={{
                color: colors.greenAccent[500],
                mr: 2,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: colors.grey[100],
                fontWeight: 500,
              }}
            >
              Loading products...
            </Typography>
          </Box>
        </CardContent>
      </Card>
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
                    index={page * rowsPerPage + index + 1}
                    product={product}
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
                No products found. Create your first product!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ProductTable;
