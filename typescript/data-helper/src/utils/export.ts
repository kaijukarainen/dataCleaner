import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { ParsedData } from '../types/types';

export const exportToCSV = (data: ParsedData, filename: string = 'export.csv') => {
  const csvContent = data.formData.map(row => 
    `${row.key},${row.value}`
  ).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, filename);
};

export const exportToExcel = (data: ParsedData, filename: string = 'export.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data.formData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  // Generate Excel file buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  saveAs(blob, filename);
};