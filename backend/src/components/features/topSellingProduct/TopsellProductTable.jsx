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
  useTheme,
  TablePagination,
  Skeleton,
} from "@mui/material";
import { tokens } from "../../../theme.js";
import TopsellProductTableRow from "./TopsellProductTableRow.jsx";
import { useState } from "react";

const TopsellProductTable = ({ topSellProducts, loading }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate paginated data
  const paginatedItems = topSellProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Loading skeleton state
  if (loading && topSellProducts.length === 0) {
    return (
      <Card
        sx={{
          background: colors.primary[400],
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} sx={{ background: "transparent" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: colors.primary[500] + "10" }}>
                  {[
                    "Product",
                    "Category",
                    "Units Sold",
                    "Revenue",
                    "Stock",
                    "% Sales",
                  ].map((header) => (
                    <TableCell key={header} sx={{ py: 2 }}>
                      <Skeleton
                        variant="text"
                        width={80}
                        height={24}
                        sx={{ bgcolor: colors.primary[500] }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: rowsPerPage }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Array.from({ length: 6 }).map((_, cellIndex) => (
                      <TableCell key={cellIndex} sx={{ py: 2 }}>
                        <Skeleton
                          variant="text"
                          width="100%"
                          height={20}
                          sx={{ bgcolor: colors.primary[500] }}
                        />
                      </TableCell>
                    ))}
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
        background: colors.primary[400],
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Product Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: colors.primary[500] + "10" }}>
                <TableCell sx={{ py: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color={colors.grey[100]}
                    fontWeight={600}
                  >
                    Product
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color={colors.grey[100]}
                    fontWeight={600}
                  >
                    Category
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color={colors.grey[100]}
                    fontWeight={600}
                  >
                    Units Sold
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color={colors.grey[100]}
                    fontWeight={600}
                  >
                    Revenue
                  </Typography>
                </TableCell>
                {/* <TableCell sx={{ py: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color={colors.grey[100]}
                    fontWeight={600}
                  >
                    Stock Status
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color={colors.grey[100]}
                    fontWeight={600}
                  >
                    % of Total
                  </Typography>
                </TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedItems.map((topSellProduct, index) => (
                <TopsellProductTableRow
                  key={topSellProduct.product_id}
                  topSellProduct={topSellProduct}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination - Only show if there are products */}
        {topSellProducts.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={topSellProducts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              background: colors.primary[400],
              borderTop: `1px solid ${colors.primary[300]}20`,
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  color: colors.grey[100],
                },
            }}
          />
        )}

        {/* Empty state */}
        {topSellProducts.length === 0 && !loading && (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography variant="h6" color={colors.grey[400]}>
              No top selling products found
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TopsellProductTable;
