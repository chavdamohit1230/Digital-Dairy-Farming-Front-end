/**
 * Reports & Export utilities - PDF, Excel, CSV
 * Use with server-side data for full reports.
 */

export type ExportFormat = "pdf" | "excel" | "csv";

export interface ExportColumn {
  key: string;
  label: string;
  width?: number;
}

export function toCSV<T extends Record<string, unknown>>(rows: T[], columns: ExportColumn[]): string {
  const headers = columns.map((c) => c.label).join(",");
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = rows.map((row) => columns.map((c) => escape(row[c.key])).join(","));
  return [headers, ...lines].join("\n");
}

export function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCSV<T extends Record<string, unknown>>(
  rows: T[],
  columns: ExportColumn[],
  filename: string
) {
  const csv = toCSV(rows, columns);
  downloadBlob(csv, `${filename}.csv`, "text/csv;charset=utf-8");
}

// Placeholder for PDF/Excel - integrate with jspdf, xlsx or server-side generation
export async function exportToPDF(_title: string, _headers: string[], _rows: string[][]): Promise<void> {
  // TODO: use jspdf or server API for PDF
  throw new Error("PDF export: add jspdf or server-side PDF generation");
}

export async function exportToExcel(_title: string, _columns: ExportColumn[], _rows: unknown[]): Promise<void> {
  // TODO: use xlsx library or server API
  throw new Error("Excel export: add xlsx or server-side Excel generation");
}
