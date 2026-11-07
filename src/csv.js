export function csvField(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}
