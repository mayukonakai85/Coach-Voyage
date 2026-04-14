"use client";

import { useState } from "react";

const steps = [
  "フォームより登録",
  "登録内容を確認し、決済案内を送付",
  "決済の確認が取れ次第、招待メールを送付",
  "グループLINEとFacebookに招待",
];

export function WorkflowGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-sm">新規入会時対応</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-5 border-t border-gray-100">
          <ol className="mt-4 space-y-3">
            {steps.map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-700 leading-relaxed">{text}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
