import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: "", ...options });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const isAuthPage = req.nextUrl.pathname === "/onboarding";

  // LOG DEBUG TRÊN VERCEL
  console.log(`Ý LÂM MIDDLEWARE: [Path: ${req.nextUrl.pathname}] [Session: ${session ? 'Active' : 'None'}]`);

  if (!session) {
    if (isAuthPage) return res;
    if (req.nextUrl.pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = req.nextUrl.clone();
    url.pathname = "/onboarding";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage) {
    console.log("Ý LÂM MIDDLEWARE: Đã nhận diện thực thể, chuyển hướng về Dashboard...");
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding", "/api/ylam/:path*"],
};
