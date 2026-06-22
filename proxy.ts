import { NextResponse, type NextRequest } from "next/server";

const adminSessionCookie = "nvt_admin_session";
const churchSessionCookie = "sermonbridge_church_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicAdminPaths = [
    "/admin/login",
    "/admin/forgot-password",
    "/admin/reset-password",
  ];
  const publicChurchPaths = [
    "/church/login",
    "/church/forgot-password",
    "/church/reset-password",
  ];
  const isProtectedAdmin =
    pathname.startsWith("/admin") && !matchesPublicPath(pathname, publicAdminPaths);
  const isProtectedChurch =
    pathname.startsWith("/church") && !matchesPublicPath(pathname, publicChurchPaths);

  if (!isProtectedAdmin && !isProtectedChurch) {
    return NextResponse.next();
  }

  const authenticated = isProtectedAdmin
    ? request.cookies.get(adminSessionCookie)?.value === "admin-authenticated"
    : Boolean(request.cookies.get(churchSessionCookie)?.value);

  if (authenticated) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = isProtectedChurch ? "/church/login" : "/admin/login";
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

function matchesPublicPath(pathname: string, publicPaths: string[]) {
  return publicPaths.some(
    (publicPath) =>
      pathname === publicPath || pathname.startsWith(`${publicPath}/`),
  );
}

export const config = {
  matcher: ["/admin/:path*", "/church/:path*"],
};
