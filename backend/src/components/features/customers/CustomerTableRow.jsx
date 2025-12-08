import {
  TableRow,
  TableCell,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../theme.js";

const CustomerTableRow = ({
  index,
  customerInfor,
  onEdit,
  onDelete,
  loading,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Get gender color
  const getGenderColor = (gender) => {
    const genderLower = gender?.toLowerCase();
    switch (genderLower) {
      case "male":
        return colors.blueAccent[500];
      case "female":
        return "#EC407A";
      default:
        return colors.grey[300];
    }
  };

  // Truncate address
  const truncateAddress = (address, maxLength = 50) => {
    if (!address) return "-";
    if (address.length <= maxLength) return address;
    return `${address.substring(0, maxLength)}...`;
  };

  // Get avatar color based on name
  const getAvatarColor = (name) => {
    const colorsList = [colors.blueAccent[500], colors.greenAccent[500]];
    const index = name?.length % colorsList.length || 0;
    return colorsList[index];
  };

  return (
    <TableRow
      key={customerInfor.id}
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
      {/* Customer Code */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: colors.grey[100],
            fontFamily: "monospace",
            letterSpacing: "0.5px",
          }}
        >
          {customerInfor.customer?.customer_code || "-"}
        </Typography>
      </TableCell>

      {/* Name */}
      <TableCell sx={{ py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: getAvatarColor(customerInfor.name),
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {customerInfor.name?.charAt(0).toUpperCase() || "C"}
          </Avatar>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: colors.grey[100],
            }}
          >
            {customerInfor.name || "-"}
          </Typography>
        </Box>
      </TableCell>

      {/* Gender */}
      <TableCell sx={{ py: 2 }}>
        {customerInfor.customer?.gender ? (
          <Chip
            label={customerInfor.customer.gender}
            size="small"
            sx={{
              bgcolor: getGenderColor(customerInfor.customer.gender) + "20",
              color: getGenderColor(customerInfor.customer.gender),
              fontWeight: 600,
              borderRadius: 6,
              border: `1px solid ${getGenderColor(
                customerInfor.customer.gender
              )}30`,
              textTransform: "capitalize",
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

      {/* Address */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: colors.grey[300],
            fontSize: "0.875rem",
            lineHeight: 1.4,
          }}
        >
          {truncateAddress(customerInfor.customer?.address)}
        </Typography>
      </TableCell>

      {/* Actions */}
      <TableCell sx={{ py: 2 }}>
        <Box display="flex" gap={1}>
          <Tooltip title="Edit customer">
            <IconButton
              size="small"
              onClick={() => onEdit(customerInfor)}
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

          <Tooltip title="Delete customer">
            <IconButton
              size="small"
              onClick={() => onDelete(customerInfor)}
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

export default CustomerTableRow;
