import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // If the path starts with /admin, verify the user has administrative privileges
    if (path.startsWith("/admin")) {
      const isAuthorized = token?.role === "SUPER_ADMIN" || token?.role === "ADMIN"
      if (!isAuthorized) {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    // Role-based verification can be added here for specific dashboard modules if required
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Returns true if token exists (user is authenticated)
        return !!token
      },
    },
    pages: {
      signIn: "/login",
    }
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
  ],
}
