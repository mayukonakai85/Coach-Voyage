"use client";

import { useState } from "react";

const guideItems = [
  { icon: "👥", title: "会員管理", desc: "会員を追加→招待メールを送信→メンバーがパスワード設定してログイン" },
  { icon: "🎬", title: "動画管理", desc: "Bunny.net の動画IDを貼り付けて追加。予約公開日時の設定も可能" },
  { icon: "📅", title: "イベント管理", desc: "イベントを追加してZoom URLや会場を設定。「次回」にするとバナー表示" },
  { icon: "👨‍🏫", title: "講師管理", desc: "イベント一覧の「講師」ボタンから登録。メンバー選択または外部講師を追加" },
  { icon: "📊", title: "視聴データ", desc: "動画別・会員別の視聴状況を確認できます" },
  { icon: "🏷️", title: "タグ管理", desc: "興味関心タグを作成。メンバーがプロフィールで選択できます" },
];

export function AdminGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-orange-50 border border-orange-100 rounded-xl">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <p className="text-xs font-bold text-orange-600">管理ガイド</p>
        <svg
          className={`w-4 h-4 text-orange-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
            {guideItems.map((item) => (
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
      )}
    </div>
  );
}
