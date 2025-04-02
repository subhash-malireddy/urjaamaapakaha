import { NextResponse, type NextRequest } from "next/server";
import { ROLES_OBJ } from "@/lib/roles";
import { auth } from "@/auth";

// Define public routes that don't require authentication
const PUBLIC_PATHS = ["/auth/signin", "/auth/error"];

/**
 * Middleware function to handle authentication and authorization
 * @param request The incoming request
 * @returns NextResponse if authentication/authorization fails, undefined if allowed
 */
export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;

  // Allow access to public routes
  if (PUBLIC_PATHS.includes(pathname)) {
    return undefined;
  }

  // Get the session
  const session = await auth();

  // If no session, redirect to signin
  if (!session?.user) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Check admin routes
  if (pathname.startsWith("/admin")) {
    if (session.user.role !== ROLES_OBJ.ADMIN) {
      return new NextResponse(null, { status: 403 });
    }
  }

  // Allow access to protected routes for authenticated users
  return undefined;
}

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api/auth/signin
     * - api/auth/callback
     * - api/auth/signout
     * - api/auth/session
     * - api/auth/csrf
     * - api/auth/providers
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth/signin|api/auth/callback|api/auth/signout|api/auth/session|api/auth/csrf|api/auth/providers).*)",
  ],
};
