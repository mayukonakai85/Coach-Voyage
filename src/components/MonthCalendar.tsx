"use client";

import { useState } from "react";

type Seminar = {
  id: string;
  title: string;
  scheduledAt: Date | string;
  zoomUrl?: string | null;
};

export function MonthCalendar({ seminars }: { seminars: Seminar[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 日付キー → セミナー一覧のマップ
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

          return (
            <div key={day} className="flex flex-col items-center">
              <button
                onClick={() => setSelectedDate(isSelected ? null : key)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md"
                    : hasSeminar
                    ? "bg-blue-100 text-blue-800 font-bold ring-2 ring-blue-400 hover:bg-blue-200"
                    : isToday
                    ? "bg-gray-800 text-white font-bold"
                    : `${textColor} hover:bg-gray-100`
                }`}
              >
                {day}
              </button>
              {hasSeminar && !isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-0.5" />
              )}
            </div>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="flex items-center gap-4 mt-3 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-blue-100 ring-2 ring-blue-400 flex items-center justify-center">
            <span className="text-xs font-bold text-blue-800">9</span>
          </div>
          <span className="text-xs text-gray-500">セミナーあり</span>
        </div>
      </div>

      {/* 選択日のセミナー詳細 */}
      {selectedSeminars.length > 0 && (
        <div className="mt-4 space-y-2">
          {selectedSeminars.map((s) => {
            const d = new Date(s.scheduledAt);
            const time = d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
            return (
              <div key={s.id} className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs font-bold text-blue-700 mb-0.5">{time}〜</p>
                <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                {s.zoomUrl && (
                  <a
                    href={s.zoomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1 font-medium"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Zoomで参加する
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
