"use client";

import { useState } from "react";

type Seminar = {
  id: string;
  title: string;
  scheduledAt: Date | string;
  zoomUrl?: string | null;
  location?: string | null;
  isOnline?: boolean;
};

export function MonthCalendar({ seminars }: { seminars: Seminar[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 日付キー → セミナー一覧
  const seminarMap = new Map<string, Seminar[]>();
  seminars.forEach((s) => {
    const d = new Date(s.scheduledAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!seminarMap.has(key)) seminarMap.set(key, []);
    seminarMap.get(key)!.push(s);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function prev() {
    setSelectedDate(null);
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function next() {
    setSelectedDate(null);
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const selectedSeminars = selectedDate ? (seminarMap.get(selectedDate) ?? []) : [];

  // その月にオンライン・オフラインどちらがあるか
  const hasOnline = Array.from(seminarMap.entries()).some(([key, list]) =>
    key.startsWith(`${year}-${month}-`) && list.some(s => s.isOnline !== false)
  );
  const hasOffline = Array.from(seminarMap.entries()).some(([key, list]) =>
    key.startsWith(`${year}-${month}-`) && list.some(s => s.isOnline === false)
  );

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-sm font-bold text-gray-800">{year}年 {month + 1}月</p>
        <button onClick={next} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 曜日 */}
      <div className="grid grid-cols-7 mb-1">
        {weekdays.map((w, i) => (
          <div key={w} className={`text-center text-xs font-bold py-1 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"}`}>
            {w}
          </div>
        ))}
      </div>

      {/* 日付 */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const key = `${year}-${month}-${day}`;
          const daySeminars = seminarMap.get(key) ?? [];
          const hasSeminar = daySeminars.length > 0;
          const isSelected = selectedDate === key;
          const col = i % 7;
          const textColor = col === 0 ? "text-red-500" : col === 6 ? "text-blue-500" : "text-gray-700";

          // オンライン優先で色を決定、両方あれば青
          const hasOnlineEvent = daySeminars.some(s => s.isOnline !== false);
          const hasOfflineEvent = daySeminars.some(s => s.isOnline === false);
          const ringColor = hasOnlineEvent ? "ring-blue-400 bg-blue-100 text-blue-800" : "ring-green-400 bg-green-100 text-green-800";
          const selectedColor = hasOnlineEvent ? "bg-blue-600 text-white" : "bg-green-600 text-white";

          return (
            <div key={day} className="flex flex-col items-center">
              <button
                onClick={() => setSelectedDate(isSelected ? null : key)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? `${selectedColor} shadow-md`
                    : hasSeminar
                    ? `${ringColor} font-bold ring-2 hover:opacity-80`
                    : isToday
                    ? "bg-gray-800 text-white font-bold"
                    : `${textColor} hover:bg-gray-100`
                }`}
              >
                {day}
              </button>
              {/* 両方ある日はドットを2色表示 */}
              {hasSeminar && !isSelected && (
                <div className="flex gap-0.5 mt-0.5">
                  {hasOnlineEvent && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  {hasOfflineEvent && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 凡例 */}
      {(hasOnline || hasOffline) && (
        <div className="flex items-center gap-4 mt-3 px-1">
          {hasOnline && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-xs text-gray-500">オンライン</span>
            </div>
          )}
          {hasOffline && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500">オフライン</span>
            </div>
          )}
        </div>
      )}

      {/* 選択日の詳細 */}
      {selectedSeminars.length > 0 && (
        <div className="mt-4 space-y-2">
          {selectedSeminars.map((s) => {
            const d = new Date(s.scheduledAt);
            const time = d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
            const isOnline = s.isOnline !== false;
            return (
              <div key={s.id} className={`border rounded-xl p-3 ${isOnline ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isOnline ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                    {isOnline ? "🌐 オンライン" : "📍 オフライン"}
                  </span>
                  <p className="text-xs font-bold text-gray-500">{time}〜</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                {isOnline && s.zoomUrl ? (
                  <a href={s.zoomUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1.5 font-medium">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Zoomで参加する
                  </a>
                ) : !isOnline && s.location ? (
                  <p className="text-xs text-green-700 mt-1">📍 {s.location}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
