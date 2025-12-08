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

const SupplierTableRow = ({ index, supplier, onEdit, onDelete, loading }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Get avatar color based on supplier name
  const getAvatarColor = (name) => {
    const colorsList = [colors.blueAccent[500], colors.greenAccent[500]];
    const index = name?.length % colorsList.length || 0;
    return colorsList[index];
  };

  // Format contact info
  const formatContact = (contact) => {
    if (!contact) return "-";
    // Check if it's a phone number (contains only digits and maybe +)
    if (/^[\d\s+()-]+$/.test(contact)) {
      return contact;
    }
    // Check if it's an email
    if (contact.includes("@")) {
      return contact;
    }
    return contact;
  };

  // Truncate address
  const truncateAddress = (address, maxLength = 50) => {
    if (!address) return "-";
    if (address.length <= maxLength) return address;
    return `${address.substring(0, maxLength)}...`;
  };

  // Check if contact is email or phone
  const getContactType = (contact) => {
    if (!contact) return "text";
    if (contact.includes("@")) return "email";
    if (/^[\d\s+()-]+$/.test(contact)) return "phone";
    return "text";
  };

  return (
    <TableRow
      key={supplier.id}
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
            {supplier.name || "-"}
          </Typography>
        </Box>
      </TableCell>

      {/* Contacts */}
      <TableCell sx={{ py: 2 }}>
        {supplier.contact ? (
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: colors.grey[100],
                fontWeight: 500,
                mb: 0.5,
              }}
            >
              {formatContact(supplier.contact)}
            </Typography>
            {getContactType(supplier.contact) === "email" && (
              <Chip
                label="Email"
                size="small"
                sx={{
                  bgcolor: colors.blueAccent[500] + "20",
                  color: colors.blueAccent[500],
                  fontWeight: 500,
                  borderRadius: 6,
                  border: `1px solid ${colors.blueAccent[500]}30`,
                  height: 20,
                  fontSize: "0.7rem",
                }}
              />
            )}
            {getContactType(supplier.contact) === "phone" && (
              <Chip
                label="Phone"
                size="small"
                sx={{
                  bgcolor: colors.greenAccent[500] + "20",
                  color: colors.greenAccent[500],
                  fontWeight: 500,
                  borderRadius: 6,
                  border: `1px solid ${colors.greenAccent[500]}30`,
                  height: 20,
                  fontSize: "0.7rem",
                }}
              />
            )}
          </Box>
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
          {truncateAddress(supplier.address)}
        </Typography>
      </TableCell>

      {/* Actions */}
      <TableCell sx={{ py: 2 }}>
        <Box display="flex" gap={1}>
          <Tooltip title="Edit supplier">
            <IconButton
              size="small"
              onClick={() => onEdit(supplier)}
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

          <Tooltip title="Delete supplier">
            <IconButton
              size="small"
              onClick={() => onDelete(supplier)}
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

export default SupplierTableRow;
