import {
  TableRow,
  TableCell,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const ProductTableRow = ({ index, product, onEdit, onDelete, loading }) => {
  return (
    <>
      <TableRow key={product.id} hover>
        <TableCell>
          <Typography variant="body1" fontWeight={"medium"}>
            {index}
          </Typography>
        </TableCell>
        <TableCell>
          <Box
            component="img"
            src={product.primary_image?.url || "/no-image.png"} // safe access with fallback
            alt={product.name || "no image"}
            sx={{
              width: 100,
              height: 100,
              objectFit: "cover",
              borderRadius: 1,
            }}
          />
        </TableCell>
        <TableCell>
          <Typography valign="boddy1" fontWeight="medium">
            {product.name}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography valign="boddy1" fontWeight="medium">
            {product.category.name}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography valign="boddy1" fontWeight="medium">
            {product.sku}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography valign="boddy1" fontWeight="medium">
            {product.brand}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography valign="boddy1" fontWeight="medium">
            {product.price}
          </Typography>
        </TableCell>
        {/* Actions column */}
        <TableCell align="right">
          <Box
            display="flex"
            gap={1}
            justifyContent="flex-end" // Align icons to the right
            alignItems="center" // Vertically centered
            height="100%"
          >
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit(product)}
              disabled={loading}
            >
              <Edit />
            </IconButton>

            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(product)}
              disabled={loading}
            >
              <Delete />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>
    </>
  );
};

export default ProductTableRow;
