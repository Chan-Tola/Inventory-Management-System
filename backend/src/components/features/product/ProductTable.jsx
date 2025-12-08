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
          borderRadius: 3,
          overflow: "hidden",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 8px 32px rgba(0, 0, 0, 0.3)"
              : "0 4px 20px rgba(0, 0, 0, 0.08)",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* Table Header Skeleton */}
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              background: "transparent",
              boxShadow: "none",
            }}
          >
            <Table
              sx={{
                background: `${colors.primary[400]}`,
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: colors.primary[500] + "20",
                    borderBottom: `2px solid ${colors.primary[300]}50`,
                  }}
                >
                  {[
                    "ID",
                    "Image",
                    "Product Name",
                    "Category",
                    "SKU",
                    "Brand",
                    "Unit Price",
                    "Sale Price",
                    "Actions",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      align={header === "Actions" ? "right" : "left"}
                      sx={{
                        py: 2,
                        borderBottom: "none",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: colors.grey[100],
                          fontWeight: 600,
                          letterSpacing: "0.5px",
                          textAlign: header === "Actions" ? "right" : "left",
                        }}
                      >
                        {header}
                      </Typography>
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
                      backgroundColor: "transparent",
                      borderBottom:
                        rowIndex < rowsPerPage - 1
                          ? `1px solid ${colors.primary[300]}20`
                          : "none",
                      "&:hover": {
                        backgroundColor: colors.primary[300] + "10",
                      },
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
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
                    <TableCell sx={{ py: 2 }}>
                      <Skeleton
                        variant="circular"
                        width={50}
                        height={50}
                        sx={{
                          bgcolor: colors.primary[500],
                          borderRadius: 2,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Skeleton
                        variant="text"
                        width={120}
                        height={24}
                        sx={{ bgcolor: colors.primary[500] }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Skeleton
                        variant="rounded"
                        width={100}
                        height={28}
                        sx={{
                          bgcolor: colors.primary[500],
                          borderRadius: 6,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Skeleton
                        variant="rounded"
                        width={80}
                        height={28}
                        sx={{
                          bgcolor: colors.primary[500],
                          borderRadius: 1,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Skeleton
                        variant="text"
                        width={80}
                        height={24}
                        sx={{ bgcolor: colors.primary[500] }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Skeleton
                        variant="text"
                        width={70}
                        height={24}
                        sx={{ bgcolor: colors.primary[500] }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Skeleton
                        variant="text"
                        width={70}
                        height={24}
                        sx={{ bgcolor: colors.primary[500] }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 1,
                        }}
                      >
                        <Skeleton
                          variant="circular"
                          width={36}
                          height={36}
                          sx={{
                            bgcolor: colors.primary[500],
                          }}
                        />
                        <Skeleton
                          variant="circular"
                          width={36}
                          height={36}
                          sx={{
                            bgcolor: colors.primary[500],
                          }}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        background: `${colors.primary[400]}`,
        borderRadius: 3,
        overflow: "hidden",
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 8px 32px rgba(0, 0, 0, 0.3)"
            : "0 4px 20px rgba(0, 0, 0, 0.08)",
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            background: "transparent",
            boxShadow: "none",
          }}
        >
          <Table
            sx={{
              background: `${colors.primary[400]}`,
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: colors.primary[500] + "20",
                  borderBottom: `2px solid ${colors.primary[300]}50`,
                }}
              >
                <TableCell sx={{ py: 2, borderBottom: "none" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                    }}
                  >
                    ID
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2, borderBottom: "none" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                    }}
                  >
                    Image
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2, borderBottom: "none" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                    }}
                  >
                    Product Name
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2, borderBottom: "none" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                    }}
                  >
                    Category
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2, borderBottom: "none" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                    }}
                  >
                    SKU
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2, borderBottom: "none" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                    }}
                  >
                    Brand
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2, borderBottom: "none" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                    }}
                  >
                    Unit Price
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2, borderBottom: "none" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                    }}
                  >
                    Sale Price
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ py: 2, borderBottom: "none" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                    }}
                  >
                    Actions
                  </Typography>
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
        {productItems.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5]}
            component="div"
            count={productItems.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              background: colors.primary[400],
              color: theme.palette.text.primary,
              borderTop: `1px solid ${colors.primary[300]}30`,
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  color: theme.palette.text.primary,
                  fontSize: "0.875rem",
                },
              "& .MuiTablePagination-actions button": {
                color: theme.palette.text.primary,
              },
              "& .MuiTablePagination-select": {
                borderRadius: 2,
                border: `1px solid ${colors.primary[300]}50`,
              },
            }}
          />
        )}

        {productItems.length === 0 && !loading && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              background: colors.primary[400],
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: colors.grey[100],
                mb: 1,
              }}
            >
              No products found
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: colors.grey[300],
              }}
            >
              Create your first product to get started
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductTable;
