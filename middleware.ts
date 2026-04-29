import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/auth/confirm")
  );
}

function missingEnvResponse() {
  return new NextResponse(
    [
      "Configuration error: Supabase environment variables are not set.",
      "",
      "Add these in Vercel → Project → Settings → Environment Variables (for Production, Preview, and Development as needed):",
      "  NEXT_PUBLIC_SUPABASE_URL",
      "  NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "",
      "Redeploy after saving. Values come from Supabase → Project Settings → API.",
    ].join("\n"),
    {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function middleware(request: NextRequest) {
  let supabaseUrl: string;
  let supabaseAnonKey: string;

  try {
    const env = getSupabasePublicEnv();
    supabaseUrl = env.url;
    supabaseAnonKey = env.key;
  } catch {
    return missingEnvResponse();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user && !isPublicPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    const redirectUrl = request.nextUrl.clone();
    const nextParam = request.nextUrl.searchParams.get("next");
    if (nextParam?.startsWith("/") && !nextParam.startsWith("//")) {
      redirectUrl.pathname = nextParam;
      redirectUrl.search = "";
    } else {
      redirectUrl.pathname = "/";
      redirectUrl.search = "";
    }
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Skip Next internals (all of /_next/* — CSS, JS, maps) and static images.
     * Prevents auth logic from touching asset requests.
     */
    "/((?!_next/|favicon\\.ico|[^?]*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
