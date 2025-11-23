import {
  Box,
  Typography,
  Button,
  Chip,
  useTheme,
  InputBase,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Add } from "@mui/icons-material";
import { tokens } from "../../../theme";
const CategoryHeader = ({
  searchText,
  setSearchText,
  itemsCount,
  onAddCategory,
}) => {
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
            Category Management
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
            label={`${itemsCount} categories`}
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
              placeholder="Search"
            />
            <IconButton type="button" sx={{ p: 1 }}>
              <SearchIcon />
            </IconButton>
          </Box>
          <Button
            variant="outlined"
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
            startIcon={<Add />}
            onClick={onAddCategory}
          >
            Add Category
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default CategoryHeader;
