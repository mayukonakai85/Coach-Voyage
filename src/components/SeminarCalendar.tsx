"use client";

import { useState } from "react";

type Lecturer = {
  id: string;
  name: string;
  photoUrl: string | null;
  bio: string | null;
  user: { avatarUrl: string | null; title: string | null } | null;
};

type Seminar = {
  id: string;
  title: string;
  description?: string | null;
  scheduledAt: Date;
  endsAt?: Date | null;
  zoomUrl: string | null;
  location?: string | null;
  isOnline?: boolean;
  isNext: boolean;
  lecturers?: Lecturer[];
};

export function SeminarCalendar({ seminars }: { seminars: Seminar[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  if (seminars.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">予定されているイベントはありません</p>;
  }

  return (
    <div className="space-y-3">
      {seminars.map((seminar) => {
        const d = new Date(seminar.scheduledAt);
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const weekday = d.toLocaleDateString("ja-JP", { weekday: "short" });
        const startTime = d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
        const endTime = seminar.endsAt
          ? new Date(seminar.endsAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
          : null;
        const time = endTime ? `${startTime}〜${endTime}` : `${startTime}〜`;
        const isOpen = selected === seminar.id;
        const isOnline = seminar.isOnline !== false;
        const color = isOnline ? "blue" : "green";

        return (
          <div key={seminar.id}>
            <button
              onClick={() => setSelected(isOpen ? null : seminar.id)}
              className={`w-full text-left rounded-xl border transition-all ${
                isOpen
                  ? isOnline ? "border-blue-300 bg-blue-50" : "border-green-300 bg-green-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-4 px-4 py-3">
                {/* 日付ブロック */}
                <div className={`shrink-0 border rounded-lg px-3 py-2 text-center min-w-[64px] ${isOnline ? "border-blue-200 bg-blue-50" : "border-green-200 bg-green-50"}`}>
                  <p className={`text-xs font-bold ${isOnline ? "text-blue-600" : "text-green-600"}`}>{month}月</p>
                  <p className="text-3xl font-black text-gray-900 leading-none">{day}</p>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">（{weekday}）</p>
                </div>

                {/* タイトル・時刻 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${isOnline ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                      {isOnline ? "🌐" : "📍"}
                    </span>
                    <p className="font-semibold text-gray-900 text-sm leading-snug truncate">{seminar.title}</p>
                  </div>
                  <p className={`text-sm font-bold mt-0.5 ${isOnline ? "text-blue-600" : "text-green-600"}`}>{time}〜</p>
                  {/* 講師プレビュー */}
                  {seminar.lecturers && seminar.lecturers.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="flex -space-x-1">
                        {seminar.lecturers.slice(0, 3).map(l => {
                          const photo = l.user?.avatarUrl ?? l.photoUrl;
                          return photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={l.id} src={photo} alt={l.name} className="w-5 h-5 rounded-full object-cover border border-white" />
                          ) : (
                            <div key={l.id} className="w-5 h-5 rounded-full bg-blue-400 text-white text-xs font-bold flex items-center justify-center border border-white">{l.name.charAt(0)}</div>
                          );
                        })}
                      </div>
                      <span className="text-xs text-gray-500">
                        {seminar.lecturers.map(l => l.name).join("・")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {seminar.isNext && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isOnline ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>次回</span>
                  )}
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* 詳細展開 */}
            {isOpen && (
              <div className={`mx-2 mt-1 p-4 rounded-xl border space-y-3 ${isOnline ? "bg-blue-50 border-blue-100" : "bg-green-50 border-green-100"}`}>
                <p className="text-sm font-bold text-gray-800">{seminar.title}</p>
                <p className={`text-sm font-semibold ${isOnline ? "text-blue-700" : "text-green-700"}`}>
                  {month}月{day}日（{weekday}） {time}
                </p>
                {seminar.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{seminar.description}</p>
                )}
                {/* 講師 */}
                {seminar.lecturers && seminar.lecturers.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-2">講師</p>
                    <div className="flex flex-wrap gap-2">
                      {seminar.lecturers.map(l => {
                        const photo = l.user?.avatarUrl ?? l.photoUrl;
                        return (
                          <div key={l.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 shadow-sm">
                            {photo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={photo} alt={l.name} className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-blue-400 text-white text-xs font-bold flex items-center justify-center">{l.name.charAt(0)}</div>
                            )}
                            <div>
                              <p className="text-xs font-semibold text-gray-800">{l.name}</p>
                              {(l.user?.title || l.bio) && (
                                <p className="text-xs text-gray-400">{l.user?.title ?? l.bio}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {isOnline ? (
                  seminar.zoomUrl ? (
                    <a href={seminar.zoomUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline pt-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Zoomで参加する
                    </a>
                  ) : (
                    <p className="text-xs text-gray-400">Zoom URL は後日公開予定</p>
                  )
                ) : seminar.location ? (
                  <p className="text-sm text-green-700 font-medium">📍 {seminar.location}</p>
                ) : (
                  <p className="text-xs text-gray-400">会場は後日公開予定</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
