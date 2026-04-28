/**
 * Shared pagination helpers for `?page=` (CRUD list pages, admin views).
 */

function parseIntPage(value: string | undefined): number {
  const n = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export function parsePageFromString(
  raw: string | string[] | undefined,
): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return parseIntPage(v);
}

export function parsePageParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string = "page",
): number {
  return parsePageFromString(searchParams[key]);
}
