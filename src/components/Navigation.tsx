"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/Avatar";

export function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isAdmin = session?.user?.role === "ADMIN";

  const navLinks = [
    { href: "/home", label: "ホーム", exact: true },
    { href: "/videos", label: "Voyage Library", exact: false },
    { href: "/members", label: "メンバー", exact: false },
    { href: "/profile", label: "マイページ", exact: false },
    ...(isAdmin
      ? [
          { href: "/admin", label: "管理トップ", exact: true },
          { href: "/admin/analytics", label: "視聴データ", exact: false },
          { href: "/admin/seminars", label: "セミナー管理", exact: false },
          { href: "/admin/videos", label: "動画管理", exact: false },
          { href: "/admin/members", label: "会員管理", exact: false },
        ]
      : []),
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/home" className="flex items-center gap-2 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Coach Voyageロゴ.png"
              alt="Coach Voyage"
              className="h-8 w-auto object-contain"
            />
            <span className="font-bold text-gray-900 text-lg">
              Coach Voyage
            </span>
          </Link>

          {/* ナビゲーションリンク（デスクトップ） */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  link.exact ? pathname === link.href : pathname.startsWith(link.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ユーザーメニュー */}
          <div className="flex items-center gap-2">
            <Link href="/profile" className="hidden sm:flex items-center gap-2 hover:opacity-80 transition-opacity">
              {session?.user?.name && <Avatar name={session.user.name} avatarUrl={session.user.avatarUrl} size="sm" />}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 leading-tight">{session?.user?.name}</p>
                {isAdmin && <p className="text-xs text-blue-600 font-medium">管理者</p>}
              </div>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="btn-secondary text-sm py-1.5 px-3"
            >
              ログアウト
            </button>
          </div>
        </div>

        {/* モバイルナビゲーション */}
        <div className="md:hidden pb-3 flex gap-1 overflow-x-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                link.exact ? pathname === link.href : pathname.startsWith(link.href)
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
