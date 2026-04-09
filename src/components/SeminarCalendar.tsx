"use client";

import { useState } from "react";

type Seminar = {
  id: string;
  title: string;
  description?: string | null;
  scheduledAt: Date;
  zoomUrl: string | null;
  isNext: boolean;
};

export function SeminarCalendar({ seminars }: { seminars: Seminar[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  if (seminars.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">予定されているセミナーはありません</p>;
  }

  return (
    <div className="space-y-3">
      {seminars.map((seminar) => {
        const d = new Date(seminar.scheduledAt);
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const weekday = d.toLocaleDateString("ja-JP", { weekday: "short" });
        const time = d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
        const isOpen = selected === seminar.id;

        return (
          <div key={seminar.id}>
            <button
              onClick={() => setSelected(isOpen ? null : seminar.id)}
              className={`w-full text-left rounded-xl border transition-all ${
                isOpen ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-4 px-4 py-3">
                {/* 日付ブロック */}
                <div className="shrink-0 bg-white border border-gray-200 rounded-lg px-3 py-2 text-center min-w-[64px]">
                  <p className="text-xs font-bold text-blue-600">{month}月</p>
                  <p className="text-3xl font-black text-gray-900 leading-none">{day}</p>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">（{weekday}）</p>
                </div>

                {/* タイトル・時刻 */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm leading-snug truncate">{seminar.title}</p>
                  <p className="text-sm font-bold text-blue-600 mt-1">{time}〜</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {seminar.isNext && (
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">次回</span>
                  )}
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* 詳細展開 */}
            {isOpen && (
              <div className="mx-2 mt-1 p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
                <p className="text-sm font-bold text-gray-800">{seminar.title}</p>
                <p className="text-sm font-semibold text-blue-700">
                  {month}月{day}日（{weekday}） {time}〜
                </p>
                {seminar.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{seminar.description}</p>
                )}
                {seminar.zoomUrl ? (
                  <a
                    href={seminar.zoomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline pt-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Zoomで参加する
                  </a>
                ) : (
                  <p className="text-xs text-gray-400">Zoom URL は後日公開予定</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
