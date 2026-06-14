import { NextResponse, type NextRequest } from "next/server";

const adminSessionCookie = "nvt_admin_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedAdmin = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isProtectedChurch = pathname.startsWith("/church") && pathname !== "/church/login";

  if (!isProtectedAdmin && !isProtectedChurch) {
    return NextResponse.next();
  }

  const authenticated =
    request.cookies.get(adminSessionCookie)?.value === "admin-authenticated";

  if (authenticated) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = isProtectedChurch ? "/church/login" : "/admin/login";
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/church/:path*"],
};
