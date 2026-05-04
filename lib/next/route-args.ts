/**
 * Next.js App Router compatibility helpers.
 *
 * Next.js 15+ passes `params` and `searchParams` as Promises in some contexts.
 * `Promise.resolve(x)` returns `x` immediately when `x` is not a Promise, so these
 * helpers work on Next.js 14 (sync objects) and 15+ (Promises).
 */

export type RouteSearchParams = Record<string, string | string[] | undefined>;

export async function resolveSearchParams(
  searchParams: RouteSearchParams | Promise<RouteSearchParams>,
): Promise<RouteSearchParams> {
  return Promise.resolve(searchParams);
}

export async function resolveRouteParams<P extends Record<string, string>>(
  params: P | Promise<P>,
): Promise<P> {
  return Promise.resolve(params);
}
