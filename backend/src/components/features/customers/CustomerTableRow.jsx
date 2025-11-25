import {
  TableRow,
  TableCell,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const CustomerTableRow = ({ index, customerInfor, onEdit, onDelete, loading }) => {
  return (
    <>
      <TableRow key={customerInfor.id} hover>
        <TableCell>
          <Typography variant="body1" fontWeight={"medium"}>
            {customerInfor.customer.customer_code}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body1" fontWeight={"medium"}>
            {customerInfor.name}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body1" fontWeight="medium">
            {customerInfor.customer.gender}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body1" fontWeight="medium">
            {customerInfor.customer.address}
          </Typography>
        </TableCell>
        <TableCell>
          <Box display="flex" gap={1}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit(customerInfor)}
              disabled={loading}
            >
              <Edit />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(customerInfor)}
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

export default CustomerTableRow;
