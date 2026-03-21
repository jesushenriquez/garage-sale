import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes: handle auth as before
  if (pathname.startsWith("/admin")) {
    return await updateSession(request);
  }

  // Public routes: check maintenance mode
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const { data: config } = await supabase
    .from("store_config")
    .select("maintenance_mode")
    .eq("id", 1)
    .single();

  const isMaintenanceOn = config?.maintenance_mode === true;

  // If maintenance is on, rewrite public routes to /maintenance
  if (isMaintenanceOn && pathname !== "/maintenance") {
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    return NextResponse.rewrite(url);
  }

  // If maintenance is off but user visits /maintenance directly, redirect home
  if (!isMaintenanceOn && pathname === "/maintenance") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
