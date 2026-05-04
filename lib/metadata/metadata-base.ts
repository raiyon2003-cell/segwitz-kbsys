/**
 * Next.js `metadataBase` must be a valid absolute URL. Misconfigured env vars such as
 * `NEXT_PUBLIC_SITE_URL=my-domain.vercel.app` (missing scheme) make `new URL(...)`
 * throw and take down every route as a generic 500.
 */
export function resolveMetadataBaseUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelHost = process.env.VERCEL_URL?.trim();

  const attempts: string[] = [];
  if (explicit) attempts.push(explicit);
  if (vercelHost) attempts.push(`https://${vercelHost}`);
  attempts.push("http://localhost:3000");

  for (const raw of attempts) {
    const normalized = normalizeAbsoluteSiteUrl(raw);
    try {
      return new URL(normalized);
    } catch {
      continue;
    }
  }

  return new URL("http://localhost:3000");
}

function normalizeAbsoluteSiteUrl(raw: string): string {
  const t = raw.trim().replace(/\/+$/, "");
  if (!t) return "http://localhost:3000";
  if (/^https?:\/\//i.test(t)) return t;

  const useHttp =
    /^(localhost|\[::1\]|127\.0\.0\.1)/i.test(t) ||
    /^192\.168\.\d{1,3}\.\d{1,3}/i.test(t) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}/i.test(t);

  const scheme = useHttp ? "http" : "https";
  return `${scheme}://${t.replace(/^\/+/, "")}`;
}
