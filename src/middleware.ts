// import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next();
//   const supabase = createMiddlewareClient({ req, res });

//   const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   // If there's no session and the user is trying to access a protected route, redirect to sign up
//   if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
//     return NextResponse.redirect(new URL("/auth/signup", req.url));
//   }

//   // If there's a session and the user is trying to access auth routes, redirect to dashboard
//   if (
//     session &&
//     (req.nextUrl.pathname === "/" ||
//       req.nextUrl.pathname.startsWith("/auth/signin") ||
//       req.nextUrl.pathname.startsWith("/auth/signup"))
//   ) {
//     return NextResponse.redirect(new URL("/dashboard", req.url));
//   }

//   return res;
// }

// export const config = {
//   matcher: ["/", "/dashboard/:path*", "/auth/:path*"],
// };

import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
