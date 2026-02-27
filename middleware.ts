import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) return res;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  });

  const { data: { user } } = await supabase.auth.getUser();

  const isAuthPage = req.nextUrl.pathname === "/onboarding";
  
  // LOG DEBUG TRÊN VERCEL
  console.log(`Ý LÂM MIDDLEWARE: [Path: ${req.nextUrl.pathname}] [User: ${user ? user.email : 'None'}]`);

  if (!user) {
    if (isAuthPage) return res;

    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Nếu không có user mà cố vào dashboard, redirect sang onboarding
    const url = req.nextUrl.clone();
    url.pathname = "/onboarding";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Nếu đã login mà vào onboarding thì đẩy sang dashboard ngay lập tức
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
