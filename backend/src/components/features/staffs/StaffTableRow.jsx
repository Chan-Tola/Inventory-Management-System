import {
  TableRow,
  TableCell,
  Typography,
  Box,
  IconButton,
  capitalize,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
const StaffTableRow = ({ staffInfo, onEdit, onDelete, loading }) => {
  return (
    <>
      <TableRow key={staffInfo.id} hover>
        <TableCell>
          <Typography variant="body1" fontWeight={"medium"}>
            {staffInfo.staff?.staff_code}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography
            valign="body1"
            sx={{
              textTransform: "capitalize",
            }}
            fontWeight="medium"
          >
            {staffInfo.roles}
          </Typography>
        </TableCell>

        <TableCell>
          <Box
            component="img"
            src={staffInfo.staff?.profile_url || "/no-image.png"} // safe access with fallback
            alt={staffInfo.name || "no image"}
            sx={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: 100,
            }}
          />
        </TableCell>

        <TableCell>
          <Typography
            valign="body1"
            sx={{
              textTransform: "capitalize",
            }}
            fontWeight="medium"
          >
            {staffInfo.name}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography
            valign="body1"
            sx={{
              textTransform: "capitalize",
            }}
            fontWeight="medium"
          >
            {staffInfo.staff?.gender}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography valign="body1" fontWeight="medium">
            {staffInfo.staff?.phone}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography valign="body1" fontWeight="medium">
            {staffInfo.staff?.salary} $
          </Typography>
        </TableCell>

        <TableCell>
          <Typography valign="body1" fontWeight="medium">
            {staffInfo.staff?.hire_date}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography valign="body1" fontWeight="medium">
            {staffInfo.staff?.address}
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
              onClick={() => onEdit(staffInfo)}
              disabled={loading}
            >
              <Edit />
            </IconButton>

            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(staffInfo)}
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

export default StaffTableRow;
