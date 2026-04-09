import { prisma } from "@/lib/db";
import Link from "next/link";
import { ImportButton } from "./ImportButton";

export default async function AdminDashboard() {
  const [videoCount, memberCount, publishedCount] = await Promise.all([
    prisma.video.count(),
    prisma.user.count({ where: { role: "MEMBER" } }),
    prisma.video.count({ where: { isPublished: true } }),
  ]);

  const stats = [
    {
      label: "総動画数",
      value: videoCount,
      sub: `公開中: ${publishedCount}本`,
      href: "/admin/videos",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: "bg-blue-500",
    },
    {
      label: "会員数",
      value: memberCount,
      sub: "アクティブ会員",
      href: "/admin/analytics",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "bg-green-500",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">管理者ダッシュボード</h1>
        <p className="text-gray-500 mt-1">Coach Voyage 管理パネル</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="card p-6 hover:shadow-md transition-shadow flex items-center gap-4">
              <div className={`${stat.color} text-white p-3 rounded-xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm font-medium text-gray-700">{stat.label}</p>
                <p className="text-xs text-gray-400">{stat.sub}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bunny.net インポート */}
      <div className="mb-4">
        <ImportButton />
      </div>

      {/* クイックアクション */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">クイックアクション</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/videos/new" className="btn-primary">
            動画を追加
          </Link>
          <Link href="/admin/members" className="btn-secondary">
            会員を追加
          </Link>
        </div>
      </div>
    </div>
  );
}
