import {
  TableRow,
  TableCell,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const SupplierTableRow = ({ index, supplier, onEdit, onDelete, loading }) => {
  return (
    <>
      <TableRow key={supplier.id} hover>
        <TableCell>
          <Typography variant="body1" fontWeight={"medium"}>
            {index}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body1" fontWeight={"medium"}>
            {supplier.name}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body1" fontWeight="medium">
            {supplier.contact}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body1" fontWeight="medium">
            {supplier.address}
          </Typography>
        </TableCell>
        <TableCell>
          <Box display="flex" gap={1}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit(supplier)}
              disabled={loading}
            >
              <Edit />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(supplier)}
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

export default SupplierTableRow;
