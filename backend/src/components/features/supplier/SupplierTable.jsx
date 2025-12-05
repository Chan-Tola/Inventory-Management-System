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
import { tokens } from "../../../theme.js";
import SupplierTableRow from "./SupplierTableRow";
import { useState } from "react";

const SupplierTable = ({ supplierItems, loading, onEdit, onDelete }) => {
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
  const paginatedItems = supplierItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Skeleton loading state
  if (loading && supplierItems.length === 0) {
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
                  {["ID", "Name", "Contacts", "Address", "Actions"].map(
                    (header) => (
                      <TableCell key={header}>
                        <Skeleton
                          variant="text"
                          width={header === "Address" ? "80%" : "70%"}
                          height={30}
                          sx={{
                            bgcolor: colors.primary[500],
                            mx: "auto",
                          }}
                        />
                      </TableCell>
                    )
                  )}
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
                        width="90%"
                        height={20}
                        sx={{ bgcolor: colors.primary[500] }}
                      />
                      <Skeleton
                        variant="text"
                        width="70%"
                        height={20}
                        sx={{ bgcolor: colors.primary[500], mt: 0.5 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Skeleton
                        variant="text"
                        width="90%"
                        height={20}
                        sx={{ bgcolor: colors.primary[500] }}
                      />
                      <Skeleton
                        variant="text"
                        width="70%"
                        height={20}
                        sx={{ bgcolor: colors.primary[500], mt: 0.5 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
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
              Loading suppliers...
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
                    <strong>Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Contacts</strong>
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
                {paginatedItems.map((supplier, index) => (
                  <SupplierTableRow
                    key={supplier.id}
                    index={page * rowsPerPage + index + 1}
                    supplier={supplier}
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
            count={supplierItems.length}
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
          {supplierItems.length === 0 && !loading && (
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

export default SupplierTable;
