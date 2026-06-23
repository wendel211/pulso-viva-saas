/** Serializa linhas em CSV (RFC 4180 básico) — sem dependência externa. */
export function toCsv(headers: string[], rows: (string | number | null)[][]) {
  const escape = (value: string | number | null) => {
    if (value == null) return "";
    const str = String(value);
    if (/[",\n;]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [headers.map(escape).join(",")];
  for (const row of rows) {
    lines.push(row.map(escape).join(","));
  }
  return lines.join("\n");
}
