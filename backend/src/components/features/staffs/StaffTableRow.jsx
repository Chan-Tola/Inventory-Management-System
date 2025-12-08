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
import { tokens } from "../../../theme";

const StaffTableRow = ({ index, staffInfo, onEdit, onDelete, loading }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Format salary
  const formatSalary = (salary) => {
    if (!salary && salary !== 0) return "-";
    return `$${parseFloat(salary).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return colors.redAccent[500];
      case "staff":
        return colors.blueAccent[500];
      default:
        return colors.grey[300];
    }
  };

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
  const truncateAddress = (address, maxLength = 40) => {
    if (!address) return "-";
    if (address.length <= maxLength) return address;
    return `${address.substring(0, maxLength)}...`;
  };

  return (
    <TableRow
      key={staffInfo.id}
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
      {/* Staff ID */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: colors.grey[100],
            fontFamily: "monospace",
          }}
        >
          {staffInfo.staff?.staff_code || "-"}
        </Typography>
      </TableCell>

      {/* Role */}
      <TableCell sx={{ py: 2 }}>
        {staffInfo.roles ? (
          <Chip
            label={staffInfo.roles}
            size="small"
            sx={{
              bgcolor: getRoleColor(staffInfo.roles) + "20",
              color: getRoleColor(staffInfo.roles),
              fontWeight: 600,
              borderRadius: 6,
              border: `1px solid ${getRoleColor(staffInfo.roles)}30`,
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

      {/* Image */}
      <TableCell sx={{ py: 2 }}>
        <Avatar
          src={staffInfo.staff?.profile_url || undefined}
          alt={staffInfo.name || "Staff"}
          sx={{
            width: 40,
            height: 40,
            border: `2px solid ${colors.primary[300]}30`,
          }}
        >
          {staffInfo.name?.charAt(0).toUpperCase() || "S"}
        </Avatar>
      </TableCell>

      {/* Name */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: colors.grey[100],
          }}
        >
          {staffInfo.name || "-"}
        </Typography>
      </TableCell>

      {/* Gender */}
      <TableCell sx={{ py: 2 }}>
        {staffInfo.staff?.gender ? (
          <Chip
            label={staffInfo.staff.gender}
            size="small"
            sx={{
              bgcolor: getGenderColor(staffInfo.staff.gender) + "20",
              color: getGenderColor(staffInfo.staff.gender),
              fontWeight: 500,
              borderRadius: 6,
              border: `1px solid ${getGenderColor(staffInfo.staff.gender)}30`,
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

      {/* Phone */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: colors.grey[300],
            fontFamily: "monospace",
          }}
        >
          {staffInfo.staff?.phone || "-"}
        </Typography>
      </TableCell>

      {/* Salary */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: colors.greenAccent[500],
            fontFamily: "monospace",
          }}
        >
          {formatSalary(staffInfo.staff?.salary)}
        </Typography>
      </TableCell>

      {/* Hire Date */}
      <TableCell sx={{ py: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: colors.grey[300],
          }}
        >
          {formatDate(staffInfo.staff?.hire_date)}
        </Typography>
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
          {truncateAddress(staffInfo.staff?.address)}
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
          <Tooltip title="Edit staff">
            <IconButton
              size="small"
              onClick={() => onEdit(staffInfo)}
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

          <Tooltip title="Delete staff">
            <IconButton
              size="small"
              onClick={() => onDelete(staffInfo)}
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

export default StaffTableRow;
