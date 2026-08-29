// Small CSV export helper. Converts rows (array of objects) to a CSV file and
// triggers a browser download.

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  headers?: { key: string; label: string }[]
): string {
  if (rows.length === 0) return "";
  const cols =
    headers ??
    Object.keys(rows[0]).map((key) => ({ key, label: key }));

  const headerLine = cols.map((c) => escapeCell(c.label)).join(",");
  const bodyLines = rows.map((row) =>
    cols.map((c) => escapeCell(row[c.key])).join(",")
  );
  return [headerLine, ...bodyLines].join("\n");
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function filenameTimestamp(): string {
  return new Date().toISOString().slice(0, 10);
}
