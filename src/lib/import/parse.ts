import "server-only";
import * as XLSX from "xlsx";

import {
  ImportRowSchema,
  STATUS_MAP,
  canonicalizeHeader,
  type ImportRow,
  type RowError,
} from "./schema";

export type ParseResult = {
  rows: ImportRow[];
  errors: RowError[];
  totalRows: number;
};

/**
 * Lê um arquivo CSV/XLSX e devolve as linhas validadas e os erros por
 * linha/campo (RF03/RF04). Não persiste nada — apenas valida e normaliza.
 */
export async function parseSpreadsheet(file: File): Promise<ParseResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // Matriz com cabeçalho na primeira linha.
  const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
  if (raw.length === 0) {
    return { rows: [], errors: [], totalRows: 0 };
  }

  const headers = (raw[0] as unknown[]).map((h) => canonicalizeHeader(String(h)));
  const rows: ImportRow[] = [];
  const errors: RowError[] = [];

  for (let i = 1; i < raw.length; i++) {
    const cells = raw[i] as unknown[];
    if (cells.every((c) => c === "" || c == null)) continue; // pula linhas vazias

    const record: Record<string, unknown> = {};
    headers.forEach((key, col) => {
      if (key && cells[col] !== "" && cells[col] != null) {
        record[key] = cells[col];
      }
    });

    // Normaliza status textual para o enum interno.
    if (typeof record.status === "string") {
      const mapped = STATUS_MAP[record.status.trim().toLowerCase()];
      record.status = mapped ?? record.status;
    }

    const parsed = ImportRowSchema.safeParse(record);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push({
          row: i + 1, // 1-based, contando o cabeçalho
          field: String(issue.path[0] ?? "—"),
          message: issue.message,
        });
      }
      continue;
    }
    rows.push(parsed.data);
  }

  return { rows, errors, totalRows: raw.length - 1 };
}
