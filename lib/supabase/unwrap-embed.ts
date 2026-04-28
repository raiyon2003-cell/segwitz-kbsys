/**
 * PostgREST may return an embedded one-to-one row as T or T[].
 * Normalize to a single value for mapping.
 */
export function unwrapOne<T>(x: T | T[] | null | undefined): T | null {
  if (x == null) return null;
  return Array.isArray(x) ? (x[0] ?? null) : x;
}
