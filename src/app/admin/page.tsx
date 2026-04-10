import { prisma } from "@/lib/db";
import Link from "next/link";
import { ImportButton } from "./ImportButton";

export default async function AdminDashboard() {
  const now = new Date();

  const [
    videoCount,
    publishedCount,
    memberCount,
    activeCount,
    seminarCount,
    totalViews,
    recentVideos,
    upcomingEvents,
    recentMembers,
  ] = await Promise.all([
    prisma.video.count(),
    prisma.video.count({ where: { isPublished: true } }),
    prisma.user.count({ where: { role: "MEMBER" } }),
    prisma.user.count({ where: { role: "MEMBER", isActive: true } }),
    prisma.seminar.count({ where: { scheduledAt: { gte: now } } }),
    prisma.videoView.count(),
    prisma.video.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, isPublished: true, category: true, publishedAt: true },
    }),
    prisma.seminar.findMany({
      where: { scheduledAt: { gte: now } },
      orderBy: { scheduledAt: "asc" },
      take: 3,
    }),
    prisma.user.findMany({
      where: { role: "MEMBER" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, isActive: true, createdAt: true, invitedAt: true },
    }),
  ]);

  const stats = [
    {
      label: "動画",
      value: videoCount,
      sub: `公開中 ${publishedCount}本`,
      href: "/admin/videos",
      color: "bg-blue-500",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "会員",
      value: memberCount,
      sub: `アクティブ ${activeCount}名`,
      href: "/admin/members",
      color: "bg-green-500",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "今後のイベント",
      value: seminarCount,
      sub: "予定されているイベント",
      href: "/admin/seminars",
      color: "bg-purple-500",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "総視聴数",
      value: totalViews,
      sub: "累計視聴回数",
      href: "/admin/analytics",
      color: "bg-orange-500",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">管理者ダッシュボード</h1>
        <p className="text-gray-500 mt-1 text-sm">Coach Voyage 管理パネル</p>
      </div>

      {/* クイックガイド */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
        <p className="text-xs font-bold text-orange-600 mb-3">管理ガイド</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
          {[
            { icon: "👥", title: "会員管理", desc: "会員を追加→招待メールを送信→メンバーがパスワード設定してログイン" },
            { icon: "🎬", title: "動画管理", desc: "Bunny.net の動画IDを貼り付けて追加。予約公開日時の設定も可能" },
            { icon: "📅", title: "イベント管理", desc: "イベントを追加してZoom URLや会場を設定。「次回」にするとバナー表示" },
            { icon: "👨‍🏫", title: "講師管理", desc: "イベント一覧の「講師」ボタンから登録。メンバー選択または外部講師を追加" },
            { icon: "📊", title: "視聴データ", desc: "動画別・会員別の視聴状況を確認できます" },
            { icon: "🏷️", title: "タグ管理", desc: "興味関心タグを作成。メンバーがプロフィールで選択できます" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-2.5 bg-white rounded-lg px-3 py-2.5">
              <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group">
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex items-center gap-4">
              <div className={`${stat.color} text-white p-2.5 rounded-xl shrink-0`}>
                {stat.icon}
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                <p className="text-xs font-semibold text-gray-700 leading-tight">{stat.label}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{stat.sub}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 最近の動画 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm">最近の動画</h2>
            <div className="flex items-center gap-2">
              <ImportButton />
              <Link href="/admin/videos/new" className="btn-primary text-xs py-1.5 px-3">
                追加
              </Link>
            </div>
          </div>
          {recentVideos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">動画がまだありません</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentVideos.map((v) => (
                <li key={v.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{v.title}</p>
                    <p className="text-xs text-gray-400">{v.category} · {new Date(v.publishedAt).toLocaleDateString("ja-JP")}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {v.isPublished ? "公開中" : "非公開"}
                    </span>
                    <Link href={`/admin/videos/${v.id}/edit`} className="text-xs text-blue-600 hover:underline">編集</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="px-5 py-3 border-t border-gray-50">
            <Link href="/admin/videos" className="text-xs text-blue-600 hover:underline">すべての動画を見る →</Link>
          </div>
        </div>

        {/* 今後のイベント */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm">今後のイベント</h2>
            <Link href="/admin/seminars" className="btn-primary text-xs py-1.5 px-3">
              追加・編集
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">予定されているイベントはありません</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {upcomingEvents.map((e) => {
                const d = new Date(e.scheduledAt);
                return (
                  <li key={e.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="text-center shrink-0 w-10">
                      <p className="text-xs text-gray-400">{d.getMonth() + 1}月</p>
                      <p className="text-xl font-black text-gray-900 leading-none">{d.getDate()}</p>
                      <p className="text-xs text-gray-400">{d.toLocaleDateString("ja-JP", { weekday: "short" })}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{e.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${e.isOnline ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                          {e.isOnline ? "オンライン" : "オフライン"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}〜
                        </span>
                      </div>
                    </div>
                    {e.isNext && (
                      <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full shrink-0">次回</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <div className="px-5 py-3 border-t border-gray-50">
            <Link href="/admin/seminars" className="text-xs text-blue-600 hover:underline">すべてのイベントを見る →</Link>
          </div>
        </div>

        {/* 最近の会員 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm">最近の会員</h2>
            <Link href="/admin/members" className="btn-primary text-xs py-1.5 px-3">
              追加・管理
            </Link>
          </div>
          {recentMembers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">会員がまだいません</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentMembers.map((m) => (
                <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                    {m.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-400 truncate">{m.email}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                      {m.isActive ? "有効" : "停止"}
                    </span>
                    {m.invitedAt && (
                      <p className="text-xs text-gray-400 mt-0.5">招待済み</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="px-5 py-3 border-t border-gray-50">
            <Link href="/admin/members" className="text-xs text-blue-600 hover:underline">すべての会員を見る →</Link>
          </div>
        </div>

        {/* クイックリンク */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 text-sm mb-4">クイックアクション</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/admin/videos/new", label: "動画を追加", icon: "🎬" },
              { href: "/admin/members", label: "会員を招待", icon: "👤" },
              { href: "/admin/seminars", label: "イベントを追加", icon: "📅" },
              { href: "/admin/analytics", label: "視聴データを確認", icon: "📊" },
              { href: "/admin/tags", label: "タグを管理", icon: "🏷️" },
              { href: "/admin/tutorial", label: "管理者ガイド", icon: "📖" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-orange-50 hover:text-orange-700 transition-colors text-sm font-medium text-gray-700"
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
