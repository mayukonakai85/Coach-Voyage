"use client";

import { useState } from "react";

type Seminar = {
  id: string;
  title: string;
  scheduledAt: Date | string;
};

export function MonthCalendar({ seminars }: { seminars: Seminar[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed

  const seminarDates = new Set(
    seminars.map((s) => {
      const d = new Date(s.scheduledAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function prev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function next() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="select-none">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-sm font-bold text-gray-800">{year}年 {month + 1}月</p>
        <button onClick={next} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 mb-1">
        {weekdays.map((w, i) => (
          <div key={w} className={`text-center text-xs font-semibold py-1 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"}`}>
            {w}
          </div>
        ))}
      </div>

      {/* 日付グリッド */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const hasSeminar = seminarDates.has(`${year}-${month}-${day}`);
          const col = i % 7;
          const textColor = col === 0 ? "text-red-500" : col === 6 ? "text-blue-500" : "text-gray-700";

          return (
            <div key={day} className="flex flex-col items-center py-0.5">
              <span className={`text-xs font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? "bg-blue-600 text-white font-bold" : textColor}`}>
                {day}
              </span>
              {hasSeminar && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-0.5" />
              )}
            </div>
          );
        })}
      </div>

      {hasSeminarInMonth(seminarDates, year, month) && (
        <p className="text-xs text-blue-600 text-center mt-2 font-medium">● セミナーあり</p>
      )}
    </div>
  );
}

function hasSeminarInMonth(dates: Set<string>, year: number, month: number) {
  return Array.from(dates).some((d) => d.startsWith(`${year}-${month}-`));
}
