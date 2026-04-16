import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCachedNextSeminar, getCachedUpcomingSeminars } from "@/lib/cache";
import { SeminarCalendar } from "@/components/SeminarCalendar";
import { MonthCalendar } from "@/components/MonthCalendar";
import { WelcomePopup } from "@/components/WelcomePopup";
import { UsageGuide } from "@/components/UsageGuide";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  const now = new Date();

  const showPopup = session?.user?.loginCount === 1 || session?.user?.loginCount === 3;

  const [nextSeminar, seminars, userProfile] = await Promise.all([
    getCachedNextSeminar(),
    getCachedUpcomingSeminars(now.toISOString()),
    session && showPopup ? prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatarUrl: true, bio: true },
    }) : null,
  ]);

  return (
    <div className="space-y-8">
      {/* ウェルカムポップアップ */}
      {session && showPopup && (
        <WelcomePopup
          loginCount={session.user.loginCount ?? 1}
          userName={session.user.name ?? ""}
          avatarUrl={userProfile?.avatarUrl ?? null}
        />
      )}

      {/* 挨拶 */}
      <div>
        <p className="text-sm text-blue-600 font-semibold uppercase tracking-widest mb-1">Member page</p>
        <h1 className="text-2xl font-bold text-gray-900">
          {session?.user?.name} さん、こんにちは！
        </h1>
      </div>

      {/* サイトの使い方 */}
      <UsageGuide />

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
            <h2 className="text-sm font-bold text-gray-700 mb-4">イベントカレンダー</h2>
            <MonthCalendar seminars={seminars} />
          </div>
        </div>

        {/* セミナーリスト */}
        <div className="lg:col-span-3">
          <div className="card p-5 h-full">
            <h2 className="text-sm font-bold text-gray-700 mb-4">今後のイベント日程</h2>
            <SeminarCalendar seminars={seminars} />
          </div>
        </div>
      </div>

    </div>
  );
}

type LecturerInfo = {
  id: string;
  name: string;
  photoUrl: string | null;
  bio: string | null;
  user: { avatarUrl: string | null; title: string | null } | null;
};

// 次回セミナー横長バナー
function NextSeminarBanner({ seminar }: { seminar: { title: string; description?: string | null; scheduledAt: Date; endsAt?: Date | null; zoomUrl: string | null; lecturers?: LecturerInfo[] } }) {
  // UTCからJST（+9時間）に変換して日付を取得
  const toJST = (date: Date) => new Date(new Date(date).getTime() + 9 * 60 * 60 * 1000);
  const d = toJST(seminar.scheduledAt);
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const weekday = weekdays[d.getUTCDay()];
  const startTime = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
  const endTime = seminar.endsAt
    ? (() => { const e = toJST(seminar.endsAt); return `${String(e.getUTCHours()).padStart(2, "0")}:${String(e.getUTCMinutes()).padStart(2, "0")}`; })()
    : null;

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
            <p className="text-xl font-black text-white">{startTime}{endTime ? `〜${endTime}` : "〜"}</p>
          </div>
        </div>
      </div>

      {/* 区切り */}
      <div className="hidden sm:block w-px h-16 bg-white/20 shrink-0" />

      {/* タイトル・説明・講師 */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-lg leading-snug">{seminar.title}</p>
        {seminar.description && (
          <p className="text-blue-200 text-sm mt-1 leading-relaxed line-clamp-2">{seminar.description}</p>
        )}
        {seminar.lecturers && seminar.lecturers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {seminar.lecturers.map(l => {
              const photo = l.user?.avatarUrl ?? l.photoUrl;
              return (
                <div key={l.id} className="flex items-center gap-1.5 bg-white/10 rounded-full pl-0.5 pr-3 py-0.5">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={l.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-300 text-white text-xs font-bold flex items-center justify-center">{l.name.charAt(0)}</div>
                  )}
                  <span className="text-xs font-medium text-white">{l.name}</span>
                </div>
              );
            })}
          </div>
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
