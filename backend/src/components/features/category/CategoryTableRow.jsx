import {
  TableRow,
  TableCell,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../theme.js";

const CategoryTableRow = ({ index, category, onEdit, onDelete, loading }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Generate a color based on category name for avatar
  const getCategoryColor = (name) => {
    const colorsList = [
      colors.blueAccent[500],
      colors.greenAccent[500],
      colors.redAccent[500],
    ];
    const index = name?.length % colorsList.length || 0;
    return colorsList[index];
  };

  // Truncate long descriptions
  const truncateDescription = (description, maxLength = 60) => {
    if (!description) return "No description";
    if (description.length <= maxLength) return description;
    return `${description.substring(0, maxLength)}...`;
  };

  return (
    <TableRow
      key={category.id}
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
      {/* Simple ID */}
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

      {/* Name */}
      <TableCell sx={{ py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: colors.grey[100],
            }}
          >
            {category.name}
          </Typography>
        </Box>
      </TableCell>

      {/* Description */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: colors.grey[300],
            lineHeight: 1.5,
          }}
        >
          {truncateDescription(category.description)}
        </Typography>
      </TableCell>

      {/* Actions */}
      <TableCell sx={{ py: 2 }}>
        <Box display="flex" gap={1}>
          <Tooltip title="Edit category">
            <IconButton
              size="small"
              onClick={() => onEdit(category)}
              disabled={loading}
              sx={{
                backgroundColor: colors.blueAccent[500] + "15",
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

          <Tooltip title="Delete category">
            <IconButton
              size="small"
              onClick={() => onDelete(category)}
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

export default CategoryTableRow;
