"use client";

import Link from "next/link";

export function ProfilePopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-7 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors"
          aria-label="閉じる"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👤</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">プロフィールを完成させましょう</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            自己紹介や興味関心タグを登録すると、メンバー同士の交流が深まり、セミナー内容やコンテンツ制作にも活かされます。
          </p>
        </div>

        <div className="space-y-2">
          <Link
            href="/profile"
            onClick={onClose}
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors text-sm text-center"
          >
            マイページへ
          </Link>
          <button
            onClick={onClose}
            className="block w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors"
          >
            あとで
          </button>
        </div>
      </div>
    </div>
  );
}
