import {
  TableRow,
  TableCell,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Badge,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../theme";

const ProductTableRow = ({ index, product, onEdit, onDelete, loading }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return "-";
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Get status color for stock indicator (if you have stock field)
  const getStockStatus = (stock) => {
    if (stock === undefined || stock === null) return null;
    if (stock > 10) return colors.greenAccent[500];
    if (stock > 0) return colors.yellowAccent[500];
    return colors.redAccent[500];
  };

  return (
    <TableRow
      key={product.id}
      hover
      sx={{
        borderBottom: `1px solid ${colors.primary[300]}20`,
        backgroundColor: "transparent",
        "&:hover": {
          backgroundColor: colors.primary[300] + "10",
        },
        transition: "background-color 0.2s ease",
      }}
    >
      {/* ID */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: colors.grey[300],
            fontFamily: "monospace",
          }}
        >
          {index}
        </Typography>
      </TableCell>

      {/* Image */}
      <TableCell sx={{ py: 2 }}>
        <Box
          component="img"
          loading="lazy"
          src={product.primary_image?.url || "/no-image.png"}
          alt={product.name || "no image"}
          sx={{
            width: 50,
            height: 50,
            objectFit: "cover",
            borderRadius: 2,
            border: `2px solid ${colors.primary[300]}30`,
            transition: "transform 0.2s ease",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        />
      </TableCell>

      {/* Product Name */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: colors.grey[100],
          }}
        >
          {product.name}
        </Typography>
      </TableCell>

      {/* Category */}
      <TableCell sx={{ py: 2 }}>
        {product?.category?.name ? (
          <Chip
            label={product.category.name}
            size="small"
            sx={{
              bgcolor: colors.blueAccent[500] + "20",
              color: colors.blueAccent[500],
              fontWeight: 500,
              borderRadius: 6,
              border: `1px solid ${colors.blueAccent[500]}30`,
            }}
          />
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: colors.grey[400],
              fontStyle: "italic",
            }}
          >
            No category
          </Typography>
        )}
      </TableCell>

      {/* SKU */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: colors.grey[300],
            fontFamily: "monospace",
            fontWeight: 500,
          }}
        >
          {product.sku || "-"}
        </Typography>
      </TableCell>

      {/* Brand */}
      <TableCell sx={{ py: 2 }}>
        {product.brand ? (
          <Chip
            label={product.brand}
            size="small"
            variant="outlined"
            sx={{
              borderColor: colors.primary[300],
              color: colors.grey[200],
              fontWeight: 500,
              borderRadius: 1,
            }}
          />
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: colors.grey[400],
              fontStyle: "italic",
            }}
          >
            -
          </Typography>
        )}
      </TableCell>

      {/* Price */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: colors.greenAccent[500],
            fontFamily: "monospace",
            letterSpacing: "0.5px",
          }}
        >
          {formatPrice(product.price)}
        </Typography>
      </TableCell>

      {/* Sale Price */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: colors.redAccent[500],
            fontFamily: "monospace",
            letterSpacing: "0.5px",
          }}
        >
          {formatPrice(product.sale_price)}
        </Typography>
      </TableCell>

      {/* Actions */}
      <TableCell align="right" sx={{ py: 2 }}>
        <Box
          display="flex"
          gap={1}
          justifyContent="flex-end"
          alignItems="center"
        >
          <Tooltip title="Edit product">
            <IconButton
              size="small"
              onClick={() => onEdit(product)}
              disabled={loading}
              sx={{
                backgroundColor: colors.blueAccent[500] + "15",
                color: colors.blueAccent[500],
                "&:hover": {
                  backgroundColor: colors.blueAccent[500] + "25",
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s ease",
                borderRadius: 2,
                width: 36,
                height: 36,
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete product">
            <IconButton
              size="small"
              onClick={() => onDelete(product)}
              disabled={loading}
              sx={{
                backgroundColor: colors.redAccent[500] + "15",
                color: colors.redAccent[500],
                "&:hover": {
                  backgroundColor: colors.redAccent[500] + "25",
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s ease",
                borderRadius: 2,
                width: 36,
                height: 36,
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default ProductTableRow;
