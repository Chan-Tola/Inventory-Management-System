import { Box, Typography, Button, Chip, useTheme } from "@mui/material";
import { Refresh, Add } from "@mui/icons-material";
const CategoryHeader = ({ itemsCount, loading, onAddCategory, onRefresh }) => {
  const theme = useTheme();
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
            startIcon={<Refresh />}
            onClick={onRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
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
