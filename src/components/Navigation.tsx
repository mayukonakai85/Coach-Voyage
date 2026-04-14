"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { NavAvatar } from "@/components/NavAvatar";
import { NotificationBell } from "@/components/NotificationBell";

export function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "ADMIN";

  const memberLinks = [
    { href: "/home", label: "ホーム", exact: true },
    { href: "/videos", label: "Voyage Library", exact: false },
    { href: "/notes", label: "ノート", exact: false },
    { href: "/members", label: "メンバー", exact: false },
  ];

  const isAdminActive = pathname.startsWith("/admin");

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/home" className="flex items-center gap-2 shrink-0">
              <Image src="/Coach Voyageロゴ.png" alt="Coach Voyage" width={112} height={28} className="h-7 w-auto object-contain" priority />
            <span className="font-bold text-gray-900 text-base hidden sm:block">Coach Voyage</span>
          </Link>

          {/* デスクトップナビ */}
          <nav className="hidden md:flex items-center gap-1">
            {memberLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  link.exact ? pathname === link.href : pathname.startsWith(link.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* 管理リンク（1つに集約） */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isAdminActive ? "bg-orange-50 text-orange-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                管理
              </Link>
            )}
          </nav>

          {/* 動画検索バー（videos配下のみ表示） */}
          {pathname.startsWith("/videos") && (
            <form action="/videos/search" method="get" className="hidden md:block">
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="search"
                  name="q"
                  placeholder="動画を検索..."
                  className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-44 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:w-56 transition-all bg-gray-50"
                />
              </div>
            </form>
          )}

          {/* ユーザーメニュー */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link href="/profile" className="hidden sm:flex items-center gap-2 hover:opacity-80 transition-opacity">
              {session?.user?.name && <NavAvatar name={session.user.name} fallbackUrl={session.user.avatarUrl} />}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 leading-tight">{session?.user?.name}</p>
                {isAdmin && <p className="text-xs text-orange-600 font-medium">管理者</p>}
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

        {/* モバイルナビ */}
        <div className="md:hidden pb-3 flex gap-1 overflow-x-auto">
          {memberLinks.map((link) => (
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
          {isAdmin && (
            <Link
              href="/admin"
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isAdminActive ? "bg-orange-50 text-orange-700" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              管理
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
