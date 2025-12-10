import { TableRow, TableCell, Typography, Box, Chip } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../theme.js";

const TopsellProductTableRow = ({ topSellProduct }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Utility function to format currency values
  const formatPrice = (price) => {
    if (!price && price !== 0) return "$0.00";
    return `$${parseFloat(price).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <TableRow
      hover
      sx={{ "&:hover": { backgroundColor: colors.primary[300] + "08" } }}
    >
      {/* Product Column: Displays product image and name */}
      <TableCell sx={{ py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            component="img"
            src={topSellProduct.image_url || "/no-image.png"}
            alt={topSellProduct.product_name}
            sx={{
              width: 64,
              height: 64,
              objectFit: "cover",
              borderRadius: 1,
              border: `1px solid ${colors.primary[300]}30`,
            }}
          />
          <Box>
            <Typography
              variant="body2"
              fontWeight={600}
              color={colors.grey[100]}
            >
              {topSellProduct.product_name}
            </Typography>
            <Typography variant="caption" color={colors.grey[400]}>
              SKU: {topSellProduct.sku}
            </Typography>
          </Box>
        </Box>
      </TableCell>

      {/* Category Column: Shows product category with color-coded chip */}
      <TableCell sx={{ py: 2 }}>
        <Chip
          label={topSellProduct.category || "Uncategorized"}
          size="small"
          sx={{
            bgcolor: colors.blueAccent[500] + "10",
            color: colors.blueAccent[500],
            borderRadius: 1,
          }}
        />
      </TableCell>

      {/* Units Sold Column: Displays total quantity sold with order count */}
      <TableCell sx={{ py: 2 }}>
        <Typography variant="body2" fontWeight={700} color={colors.grey[100]}>
          {topSellProduct.total_quantity_sold.toLocaleString()}
        </Typography>
        <Typography variant="caption" color={colors.grey[400]}>
          {topSellProduct.order_count} orders
        </Typography>
      </TableCell>

      {/* Revenue Column: Shows total revenue with per-unit price */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          fontWeight={700}
          color={colors.redAccent[500]}
        >
          {formatPrice(topSellProduct.total_sales_amount)}
        </Typography>
        <Typography variant="caption" color={colors.grey[400]}>
          {formatPrice(topSellProduct.price)} each
        </Typography>
      </TableCell>

      {/* Stock Status Column: Color-coded stock indicator with quantity */}
      <TableCell sx={{ py: 2 }}>
        <Chip
          label={topSellProduct.is_in_stock ? "In Stock" : "Out of Stock"}
          size="small"
          sx={{
            bgcolor: topSellProduct.is_in_stock
              ? colors.greenAccent[500] + "10"
              : colors.redAccent[500] + "10",
            color: topSellProduct.is_in_stock
              ? colors.greenAccent[500]
              : colors.redAccent[500],
          }}
        />
        <Typography
          variant="caption"
          display="block"
          color={colors.grey[400]}
          mt={0.5}
        >
          Stock: {topSellProduct.current_stock}
        </Typography>
      </TableCell>

      {/* Sales Percentage Column: Visual progress bar with percentage value */}
      <TableCell sx={{ py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              flex: 1,
              height: 6,
              bgcolor: colors.primary[500],
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${Math.min(topSellProduct.sales_percentage, 100)}%`,
                height: "100%",
                bgcolor: colors.redAccent[500],
              }}
            />
          </Box>
          <Typography variant="body2" fontWeight={600} minWidth={50}>
            {topSellProduct.sales_percentage.toFixed(1)}%
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default TopsellProductTableRow;
