/* eslint-disable consistent-return */
import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request) {
  const pathname = request?.nextUrl?.pathname;
  let utParams = request?.nextUrl?.searchParams?.get("ut");
  let planId = request?.nextUrl?.searchParams?.get("pi"); // before payment if profile is not set redirect to select profile
  let st = request?.nextUrl?.searchParams?.get("st"); // after payment success if profile is not set redirect to select profile

    // Check if this is an SSO URL
  const isSSO = request?.nextUrl?.searchParams?.has("token") && request?.nextUrl?.searchParams?.has("source");
  
  if (pathname.includes(".js") || !!planId || !!st) {
    return;
  }
  if (utParams && !pathname.includes("sso/manage")) {
    try {
      utParams = encodeURI(
        btoa(
          `${atob(decodeURI(utParams))}&&&redirect===${pathname.substring(1)}`
        )
      );
      // eslint-disable-next-line no-empty
    } catch (error) {}
    return NextResponse.redirect(
      new URL(`/sso/manage?ut=${utParams}`, request.url)
    );
  }
  const userData = JSON.parse(
    request.cookies.get(`_user-info_v3`)?.value || null
  );
  const protectedPaths = [
    "/profiles/",
    "/buy/order-summary",
    "/buy/payment-success",
    "/buy/payment-status",
    "/buy/payment-failure",
    "/active/screens",
    "/settings/",
    "/transaction",
    "/signup",
    "/list",
    "/plans/subscribe",
    "/languages",
    "/genre",
  ];
  // check if user is logged in or not
  if (userData?.isLoggedIn) {
    if (
      pathname === "/signin" ||
      pathname === "/signup" ||
      pathname === "/forgot-password"
    ) {
      // if user is logged in and opens signin or signup page then we need to redirect to profile selection
      return NextResponse.redirect(new URL(`/`, request.url));
    }
    
    // Allow SSO URLs to pass through without profile redirect
    if (isSSO) {
      return NextResponse.next();
    }
    
    if (
      !userData?.isUtUser &&
      !pathname.startsWith("/profiles/") &&
      userData?.hasUserProfiles &&
      (!userData?.expiryTime || userData?.expiryTime < new Date().getTime()) &&
      !["/languages", "/genre"].includes(pathname) &&
      !userData.isSignup
    ) {
      // write conditions for profile expiry
      return NextResponse.redirect(
        new URL(
          `/profiles/select-user-profile?referer=${pathname}`,
          request.url
        )
      );
    }
  } else if (
    !userData?.isLoggedIn &&
    protectedPaths.some((path) => pathname.startsWith(path))
  ) {
    // if user is not logged in redirect to login
    return NextResponse.redirect(new URL(`/signin`, request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
