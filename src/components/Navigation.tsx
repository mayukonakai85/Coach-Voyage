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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
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
