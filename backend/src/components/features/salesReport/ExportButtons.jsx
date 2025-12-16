// components/features/salesReport/ExportButtons.jsx
import React from "react";
import { Button, Tooltip, Menu, MenuItem } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";
import {
  exportSalesReport,
  exportSimpleSalesReport,
} from "../../../utils/exportExcel";
import { toast } from "react-hot-toast";

const ExportButtons = ({ reportData }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // const handleExportMultiSheet = () => {
  //   try {
  //     if (!reportData || !reportData.success) {
  //       toast.error("No report data available for export");
  //       return;
  //     }
  //     exportSalesReport(reportData);
  //     toast.success("Excel report downloaded!");
  //   } catch (error) {
  //     console.error("Export error:", error);
  //     toast.error("Failed to export report");
  //   } finally {
  //     handleMenuClose();
  //   }
  // };

  const handleExportSingleSheet = () => {
    try {
      if (!reportData || !reportData.success) {
        toast.error("No report data available for export");
        return;
      }
      exportSimpleSalesReport(reportData);
      toast.success("Excel report downloaded!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report");
    } finally {
      handleMenuClose();
    }
  };

  return (
    <>
      <Tooltip title="Export Report">
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleExportSingleSheet}
          disabled={!reportData || !reportData.success}
          size="medium"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            boxShadow: 1,
            "&:hover": {
              boxShadow: 3,
            },
          }}
        >
          Export To Sheetes
        </Button>
      </Tooltip>

      {/* <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            mt: 1,
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={handleExportMultiSheet} sx={{ py: 1.5 }}>
          <DescriptionIcon
            fontSize="small"
            sx={{ mr: 1.5, color: "primary.main" }}
          />
          Multi-Sheet Report
        </MenuItem>
        <MenuItem onClick={handleExportSingleSheet} sx={{ py: 1.5 }}>
          <TableChartIcon
            fontSize="small"
            sx={{ mr: 1.5, color: "success.main" }}
          />
          Single Sheet Report
        </MenuItem>
      </Menu> */}
    </>
  );
};

export default ExportButtons;
