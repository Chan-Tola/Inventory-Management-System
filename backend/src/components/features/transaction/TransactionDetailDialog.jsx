import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Grid,
  Paper,
  Stack,
} from "@mui/material";
import {
  Receipt,
  Inventory,
  AttachMoney,
  Person,
  CalendarToday,
  Notes,
} from "@mui/icons-material";

const TransactionDetailDialog = ({ open, onClose, transaction, loading }) => {
  if (!transaction) return null;

  const getTransactionColor = () => {
    return transaction.transaction_type?.toLowerCase() === "in"
      ? "success"
      : "error";
  };

  const getMoneyColor = () => {
    return transaction.money_type?.toLowerCase() === "expense"
      ? "error"
      : "success";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="600">
            Transaction Report
          </Typography>
          <Chip
            label={transaction.transaction_type_display}
            color={getTransactionColor()}
            size="small"
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          ID: #{transaction.id} •{" "}
          {new Date(transaction.transaction_date).toLocaleDateString()}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Summary Section */}
            <Box sx={{ py: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Product
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {transaction.product?.name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Quantity
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {transaction.quantity} units
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="600"
                    color={getMoneyColor()}
                  >
                    ${transaction.amount}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Financial Impact
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="500"
                    color={
                      transaction.money_impact < 0
                        ? "error.main"
                        : "success.main"
                    }
                  >
                    ${transaction.money_impact}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Details Section */}
            <Box>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Details
              </Typography>
              <Stack spacing={2}>
                {/* Supplier */}
                {transaction.supplier && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Supplier
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {transaction.supplier.name}
                    </Typography>
                  </Box>
                )}

                {/* Money Type */}
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Money Type
                  </Typography>
                  <Chip
                    label={transaction.money_type}
                    color={getMoneyColor()}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                {/* Stock Impact */}
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Stock Impact
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="500"
                    color={
                      transaction.stock_impact > 0
                        ? "success.main"
                        : "error.main"
                    }
                  >
                    {transaction.stock_impact > 0 ? "+" : ""}
                    {transaction.stock_impact}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Timeline Section */}
            <Box>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Timeline
              </Typography>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Transaction Date
                  </Typography>
                  <Typography variant="body2">
                    {new Date(transaction.transaction_date).toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {new Date(transaction.created_at).toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Updated
                  </Typography>
                  <Typography variant="body2">
                    {new Date(transaction.updated_at).toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Notes Section */}
            {transaction.notes && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    Notes
                  </Typography>
                  <Box>
                    <Typography variant="body2" fontStyle="italic">
                      {transaction.notes}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 1 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionDetailDialog;
