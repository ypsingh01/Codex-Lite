import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("codex_token")?.value;
  const role = request.cookies.get("codex_role")?.value;

  // Client-side auth uses localStorage; we can't read it here.
  // So we only do path-based redirect for unauthenticated-looking requests.
  // Actual protection: pages that need auth read from localStorage and redirect.
  const path = request.nextUrl.pathname;

  const isCandidateRoute = path.startsWith("/candidate");
  const isInterviewerRoute = path.startsWith("/interviewer");
  const isInterviewRoute = path.startsWith("/interview");
  const isAuthRoute = path.startsWith("/login") || path.startsWith("/register");

  if (isCandidateRoute || isInterviewerRoute || isInterviewRoute) {
    if (!token && !role) {
      const loginUrl = new URL("/login", request.url);
      if (isCandidateRoute) loginUrl.searchParams.set("role", "candidate");
      if (isInterviewerRoute) loginUrl.searchParams.set("role", "interviewer");
      return NextResponse.redirect(loginUrl);
    }
    if (isCandidateRoute && role !== "candidate") {
      return NextResponse.redirect(new URL("/login?role=candidate", request.url));
    }
    if (isInterviewerRoute && role !== "interviewer") {
      return NextResponse.redirect(new URL("/login?role=interviewer", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/candidate/:path*", "/interviewer/:path*", "/interview/:path*"],
};
