"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { NavAvatar } from "@/components/NavAvatar";
import { NotificationBell } from "@/components/NotificationBell";

export function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "ADMIN";
  const [adminOpen, setAdminOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAdminOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const memberLinks = [
    { href: "/home", label: "ホーム", exact: true },
    { href: "/videos", label: "Voyage Library", exact: false },
    { href: "/notes", label: "ノート", exact: false },
    { href: "/members", label: "メンバー", exact: false },
    { href: "/profile", label: "マイページ", exact: false },
  ];

  const adminLinks = [
    { href: "/admin", label: "管理トップ", exact: true },
    { href: "/admin/analytics", label: "視聴データ" },
    { href: "/admin/seminars", label: "イベント管理" },
    { href: "/admin/videos", label: "動画管理" },
    { href: "/admin/members", label: "会員管理" },
    { href: "/admin/tags", label: "タグ管理" },
    { href: "/admin/tutorial", label: "管理者ガイド" },
  ];

  const isAdminActive = pathname.startsWith("/admin");

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/home" className="flex items-center gap-2 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Coach Voyageロゴ.png" alt="Coach Voyage" className="h-7 w-auto object-contain" />
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

            {/* 管理ドロップダウン */}
            {isAdmin && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setAdminOpen(!adminOpen)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isAdminActive ? "bg-orange-50 text-orange-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  管理
                  <svg className={`w-3.5 h-3.5 transition-transform ${adminOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {adminOpen && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    {adminLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setAdminOpen(false)}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          pathname === link.href || (!('exact' in link) && pathname.startsWith(link.href))
                            ? "bg-orange-50 text-orange-700 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

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
          {isAdmin && adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href || pathname.startsWith(link.href)
                  ? "bg-orange-50 text-orange-700"
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
