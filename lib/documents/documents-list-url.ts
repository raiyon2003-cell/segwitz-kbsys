/**
 * Build `/documents?...` hrefs (dashboard filters, deep links). Centralizes
 * param naming with `lib/documents/list-params` (`view`, `status`, `division`, `type`).
 */
export function getDocumentsListUrl(
  q: Record<string, string | undefined>,
): string {
  const o: Record<string, string> = {};
  for (const [k, v] of Object.entries(q)) {
    if (v !== undefined && v !== "") o[k] = v;
  }
  const qs = new URLSearchParams(o).toString();
  return qs.length > 0 ? `/documents?${qs}` : "/documents";
}
