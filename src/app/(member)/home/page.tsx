import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SeminarCalendar } from "@/components/SeminarCalendar";
import { MonthCalendar } from "@/components/MonthCalendar";
import { WelcomePopup } from "@/components/WelcomePopup";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  const [nextSeminar, seminars, userProfile] = await Promise.all([
    prisma.seminar.findFirst({ where: { isNext: true } }),
    prisma.seminar.findMany({
      where: { scheduledAt: { gte: new Date() } },
      orderBy: { scheduledAt: "asc" },
    }),
    session ? prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatarUrl: true, bio: true },
    }) : null,
  ]);

  return (
    <div className="space-y-8">
      {/* ウェルカムポップアップ */}
      {session && (
        <WelcomePopup
          loginCount={session.user.loginCount ?? 1}
          userName={session.user.name ?? ""}
          avatarUrl={userProfile?.avatarUrl ?? null}
        />
      )}

      {/* 挨拶 */}
      <div>
        <p className="text-sm text-blue-600 font-semibold uppercase tracking-widest mb-1">Member Portal</p>
        <h1 className="text-2xl font-bold text-gray-900">
          {session?.user?.name} さん、こんにちは！
        </h1>
      </div>

      {/* 次回セミナー：横長バナー */}
      {nextSeminar ? (
        <NextSeminarBanner seminar={nextSeminar} />
      ) : (
        <div className="card p-5 text-center text-gray-400 text-sm">
          次回セミナーは調整中です
        </div>
      )}

      {/* セミナー日程：カレンダー＋リスト */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ミニカレンダー */}
        <div className="lg:col-span-2">
          <div className="card p-5 h-full">
            <h2 className="text-sm font-bold text-gray-700 mb-4">セミナーカレンダー</h2>
            <MonthCalendar seminars={seminars} />
          </div>
        </div>

        {/* セミナーリスト */}
        <div className="lg:col-span-3">
          <div className="card p-5 h-full">
            <h2 className="text-sm font-bold text-gray-700 mb-4">今後のセミナー日程</h2>
            <SeminarCalendar seminars={seminars} />
          </div>
        </div>
      </div>

      {/* サイトの使い方 */}
      <div className="card p-6">
        <h2 className="text-base font-bold text-gray-800 mb-5">メンバーサイトの使い方</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: "🎬",
              title: "Voyage Library",
              desc: "カテゴリ別に動画を視聴できます。視聴済み動画には印がつきます。",
              href: "/videos",
            },
            {
              icon: "📝",
              title: "学習ノート",
              desc: "動画ごとにメモを書き残せます。あとから一覧でまとめて確認できます。",
              href: "/notes",
            },
            {
              icon: "👥",
              title: "メンバー",
              desc: "一緒に学ぶメンバーのプロフィールを確認できます。",
              href: "/members",
            },
            {
              icon: "👤",
              title: "マイページ",
              desc: "プロフィール写真・自己紹介・タグなどを編集できます。",
              href: "/profile",
            },
          ].map((item) => (
            <Link key={item.title} href={item.href} className="group block rounded-xl bg-gray-50 hover:bg-blue-50 p-4 transition-colors">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="font-bold text-sm text-gray-900 group-hover:text-blue-700 transition-colors mb-1">{item.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// 次回セミナー横長バナー
function NextSeminarBanner({ seminar }: { seminar: { title: string; description?: string | null; scheduledAt: Date; zoomUrl: string | null } }) {
  const d = new Date(seminar.scheduledAt);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = d.toLocaleDateString("ja-JP", { weekday: "short" });
  const time = d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-5 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center gap-4">
      {/* ラベル */}
      <div className="shrink-0">
        <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">Next Seminar</p>
        {/* 日付ブロック */}
        <div className="flex items-end gap-2">
          <div className="text-center">
            <p className="text-xs font-bold text-blue-300 leading-none mb-0.5">{month}月</p>
            <p className="text-5xl font-black leading-none">{day}</p>
          </div>
          <div className="mb-0.5">
            <p className="text-base font-bold text-blue-200">（{weekday}）</p>
            <p className="text-xl font-black text-white">{time}〜</p>
          </div>
        </div>
      </div>

      {/* 区切り */}
      <div className="hidden sm:block w-px h-16 bg-white/20 shrink-0" />

      {/* タイトル・説明 */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-lg leading-snug">{seminar.title}</p>
        {seminar.description && (
          <p className="text-blue-200 text-sm mt-1 leading-relaxed line-clamp-2">{seminar.description}</p>
        )}
      </div>

      {/* Zoomボタン */}
      {seminar.zoomUrl ? (
        <a
          href={seminar.zoomUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Zoomで参加
        </a>
      ) : (
        <p className="shrink-0 text-xs text-blue-300">Zoom URL は後日公開</p>
      )}
    </div>
  );
}
