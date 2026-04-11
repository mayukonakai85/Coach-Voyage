"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Settings = {
  isEnabled: boolean;
  title: string;
  body: string;
  buttonText: string;
  buttonUrl?: string | null;
};

export function EventPopupForm({ defaultSettings }: { defaultSettings: Settings }) {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(defaultSettings.isEnabled);
  const [title, setTitle] = useState(defaultSettings.title);
  const [body, setBody] = useState(defaultSettings.body);
  const [buttonText, setButtonText] = useState(defaultSettings.buttonText || "詳細を見る");
  const [buttonUrl, setButtonUrl] = useState(defaultSettings.buttonUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/admin/popup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "event", isEnabled, title, body, buttonText, buttonUrl }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* ON/OFFトグル */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="text-sm font-semibold text-gray-700">表示 ON/OFF</p>
          <p className="text-xs text-gray-400 mt-0.5">{isEnabled ? "全メンバーのログイン時に表示中" : "現在は非表示"}</p>
        </div>
        <button
          onClick={() => setIsEnabled(v => !v)}
          className={`relative inline-flex w-12 h-6 rounded-full transition-colors ${isEnabled ? "bg-purple-600" : "bg-gray-300"}`}
        >
          <span className={`inline-block w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5 ${isEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-300"
          placeholder="例：次回セミナーのご案内"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">本文</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-300 resize-none"
          placeholder="例：〇月〇日（土）14:00〜 テーマ：〇〇〇&#10;詳細はカレンダーをご確認ください。"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">ボタンテキスト</label>
          <input
            type="text"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-300"
            placeholder="詳細を見る"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            ボタンリンク<span className="text-gray-400 font-normal ml-1">（任意）</span>
          </label>
          <input
            type="url"
            value={buttonUrl}
            onChange={(e) => setButtonUrl(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-300"
            placeholder="https://..."
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
      >
        {saving ? "保存中…" : saved ? "保存しました ✓" : "設定を保存"}
      </button>
    </div>
  );
}
