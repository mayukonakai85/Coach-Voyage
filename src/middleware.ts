import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

    // 管理者ページへのアクセスは ADMIN ロールのみ許可
    if (isAdminRoute && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/videos", req.url));
    }
  },
  {
    callbacks: {
      // トークンがあればアクセス許可（ページ側でロールチェック）
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // 認証が必要なルートを指定
  matcher: ["/home", "/videos/:path*", "/admin/:path*", "/profile", "/members", "/notes", "/favorites", "/watch-later"],
};
