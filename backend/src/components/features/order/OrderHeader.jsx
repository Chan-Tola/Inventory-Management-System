import {
  Box,
  Typography,
  Chip,
  useTheme,
  InputBase,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { tokens } from "../../../theme";

const OrderHeader = ({ searchText, setSearchText, itemsCount }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Orders Management {/* ✅ CHANGED: from Supplier Management */}
          </Typography>
          <Chip
            sx={{
              color: theme.palette.text.primary,
              borderColor: theme.palette.text.primary,
              "&:hover": {
                borderColor: theme.palette.text.primary,
                backgroundColor: theme.palette.action.hover,
              },
              "&:disabled": {
                color: theme.palette.text.disabled,
                borderColor: theme.palette.text.disabled,
              },
            }}
            label={`${itemsCount} orders`}
            color="primary"
            variant="outlined"
          />
        </Box>

        <Box display="flex" gap={2}>
          {/* note: SEARCH SECTION  */}
          <Box
            display="flex"
            backgroundColor={colors.primary[400]}
            borderRadius="3px"
          >
            <InputBase
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ ml: 2, flex: 1 }}
              placeholder="Search order code..."
            />
            <IconButton type="button" sx={{ p: 1 }}>
              <SearchIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default OrderHeader;
