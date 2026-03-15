import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
 

const getNestedValue = (obj, path) => {
  return path.split(".").reduce((acc, part) => acc?.[part], obj) ?? "N/A";
};

 
export const exportToExcel = async (columns, data, fileName) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Projects");

  // Add header row
  const headers = columns.map(col => col.header);
  const headerRow = worksheet.addRow(headers);

  // Style header
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0284C7" } // Blue background
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" }
    };
  });

  // Add data rows
  data.forEach(item => {
    const row = columns.map(col => getNestedValue(item, col.accessorKey));
    worksheet.addRow(row);
  });

  // Adjust column widths
  worksheet.columns.forEach(column => {
    column.width = 20;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer]),
    `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`
  );
};

/**
 * Export data to PDF
 * @param {Array} columns - same as Excel
 * @param {Array} data - same as Excel
 * @param {String} fileName - base file name
 */
export const exportToPDF = (columns, data, fileName) => {
  const doc = new jsPDF("l", "mm", "a4");

  const headers = columns.map(col => col.header);
  const rows = data.map(item =>
    columns.map(col => String(getNestedValue(item, col.accessorKey) ?? "N/A"))
  );

  doc.setFontSize(16);
  doc.text("Project Master Report", 14, 15);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

  // autoTable works in modern ESM with this call
  autoTable(doc, {
    startY: 25,
    head: [headers],
    body: rows,
    theme: "grid",
    styles: { fontSize: 9 }
  });

  doc.save(`${fileName}.pdf`);
};
