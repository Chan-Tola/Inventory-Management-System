import {
  TableRow,
  TableCell,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const CategoryTableRow = ({ index, category, onEdit, onDelete, loading }) => {
  return (
    <>
      <TableRow key={category.id} hover>
        <TableCell>
          <Typography variant="body1" fontWeight={"medium"}>
            {index}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body1" fontWeight={"medium"}>
            {category.name}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body1" fontWeight="medium">
            {category.description}
          </Typography>
        </TableCell>
        <TableCell>
          <Box display="flex" gap={1}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit(category)}
              disabled={loading}
            >
              <Edit />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(category)}
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

export default CategoryTableRow;
