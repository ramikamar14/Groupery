import * as XLSX from "xlsx";
import type { ExcelParseResult } from "../shared/types.js";

export function parseExcel(buffer: Buffer): ExcelParseResult {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });

  if (raw.length === 0) {
    return { headers: [], rows: [], totalRows: 0 };
  }

  const headers = Object.keys(raw[0]);
  const rows = raw.map((row) => {
    const out: Record<string, string> = {};
    for (const h of headers) {
      out[h] = String(row[h] ?? "").trim();
    }
    return out;
  });

  return { headers, rows, totalRows: rows.length };
}
