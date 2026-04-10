"use client";

import { useState } from "react";
import Link from "next/link";

const items = [
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
];

export function UsageGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
      >
        メンバーページの使い方はこちら
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <Link key={item.title} href={item.href} className="group block rounded-xl bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 p-4 transition-colors">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="font-bold text-sm text-gray-900 group-hover:text-blue-700 transition-colors mb-1">{item.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
