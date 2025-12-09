import React from "react";
import { Button, Stack } from "@mui/material";

const ExportButtons = ({ reportData }) => {
  const handleExport = (format) => {
    const dataStr = JSON.stringify(
      {
        report: reportData,
        exportedAt: new Date().toISOString(),
        format: format,
      },
      null,
      2
    );

    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;

    const link = document.createElement("a");
    link.setAttribute("href", dataUri);
    link.setAttribute(
      "download",
      `sales-report-${reportData.period.start_date}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Stack direction="row" spacing={1}>
      <Button
        variant="outlined"
        size="small"
        onClick={() => handleExport("pdf")}
      >
        PDF
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={() => handleExport("excel")}
      >
        Excel
      </Button>
      <Button variant="outlined" size="small" onClick={handlePrint}>
        Print
      </Button>
    </Stack>
  );
};

export default ExportButtons;
