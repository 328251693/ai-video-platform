import { createServerClient } from "@supabase/ssr";
import { NextResponse, NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();

  const protectedPaths = ["/generate", "/history", "/account"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

  // If user not logged in and trying to access protected route
  if (!user && isProtectedPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user logged in and trying to access login page
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/generate", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
};