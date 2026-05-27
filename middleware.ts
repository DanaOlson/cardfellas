import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const MAINTENANCE = process.env.MAINTENANCE_MODE === "true";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    // ── Maintenance mode ───────────────────────────────────────────────────────
    // Admins pass through; everyone else sees /maintenance
    if (MAINTENANCE && role !== "ADMIN") {
      // Don't redirect the maintenance page itself or static assets
      if (
        pathname !== "/maintenance" &&
        !pathname.startsWith("/_next") &&
        !pathname.startsWith("/api/auth")
      ) {
        return NextResponse.redirect(new URL("/maintenance", req.url));
      }
    }

    // ── Admin guard ────────────────────────────────────────────────────────────
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      // Allow unauthenticated users through so we can check maintenance mode
      // before requiring auth on protected routes
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;
        if (MAINTENANCE) return true; // let middleware handle the redirect
        if (pathname.startsWith("/account") || pathname.startsWith("/admin")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all paths except static files and images.
     * We need broad matching so maintenance mode can intercept everything.
     */
    "/((?!_next/static|_next/image|favicon.ico|icons|images).*)",
  ],
};
