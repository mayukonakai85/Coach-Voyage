import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SeminarCalendar } from "@/components/SeminarCalendar";
import { WelcomePopup } from "@/components/WelcomePopup";

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
    <div className="space-y-10">
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

      {/* セミナーセクション：カレンダー大・次回小 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* 今後のセミナーカレンダー（大） */}
        <div className="lg:col-span-3 order-1">
          <div className="card p-6 h-full">
            <h2 className="text-lg font-bold text-gray-900 mb-5">今後のセミナー日程</h2>
            <SeminarCalendar seminars={seminars} />
          </div>
        </div>

        {/* 次回セミナー（小） */}
        <div className="lg:col-span-2 order-2">
          {nextSeminar ? (
            <NextSeminarCard seminar={nextSeminar} />
          ) : (
            <div className="card p-6 h-full flex items-center justify-center text-gray-400 text-sm">
              次回セミナーは調整中です
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// 次回セミナーカード
function NextSeminarCard({ seminar }: { seminar: { title: string; description?: string | null; scheduledAt: Date; zoomUrl: string | null } }) {
  const d = new Date(seminar.scheduledAt);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = d.toLocaleDateString("ja-JP", { weekday: "short" });
  const time = d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="card p-6 h-full flex flex-col">
      <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Next Seminar</p>

      {/* 日付ブロック */}
      <div className="bg-blue-50 rounded-2xl px-5 py-4 mb-4">
        <div className="flex items-end gap-3">
          {/* 月 */}
          <div className="text-center">
            <p className="text-sm font-bold text-blue-500 leading-none mb-1">{month}月</p>
            <p className="text-6xl font-black text-gray-900 leading-none">{day}</p>
          </div>
          <div className="mb-1.5">
            <p className="text-xl font-bold text-gray-600">（{weekday}）</p>
            <p className="text-2xl font-black text-blue-700 mt-1">{time}〜</p>
          </div>
        </div>
      </div>

      <p className="text-base font-bold text-gray-900 leading-snug mb-2">{seminar.title}</p>
      {seminar.description && (
        <p className="text-sm text-gray-500 leading-relaxed mb-4">{seminar.description}</p>
      )}

      {seminar.zoomUrl ? (
        <a
          href={seminar.zoomUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Zoomで参加する
        </a>
      ) : (
        <p className="mt-auto text-xs text-gray-400">Zoom URL は後日公開予定</p>
      )}
    </div>
  );
}
