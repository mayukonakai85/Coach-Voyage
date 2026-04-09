"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar } from "@/components/Avatar";

type Props = {
  loginCount: number;
  userName: string;
  avatarUrl: string | null;
  hasBio: boolean;
};

export function WelcomePopup({ loginCount, userName, avatarUrl, hasBio }: Props) {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState(userName);
  const [bio, setBio] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 1回目 or 3回目のログインでポップアップ表示
    // ただし今セッションで既に表示済みならスキップ
    const shown = sessionStorage.getItem("welcome_shown");
    if (shown) return;
    if (loginCount === 1 || loginCount === 3) {
      setVisible(true);
      sessionStorage.setItem("welcome_shown", "1");
    }
  }, [loginCount]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/profile/avatar", { method: "POST", body: form });
    if (res.ok) {
      const data = await res.json();
      setPreviewUrl(data.avatarUrl + "?t=" + Date.now());
    }
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio }),
    });
    setSaving(false);
    setDone(true);
    setTimeout(() => setVisible(false), 1500);
  }

  function handleSkip() {
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* モーダル */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-8 pt-8 pb-10 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-2xl font-black text-white leading-tight">
            {loginCount === 1 ? "ようこそ！" : "お久しぶりです！"}
          </h2>
          <p className="text-blue-200 text-sm mt-1">
            {loginCount === 1
              ? "Coach Voyage へのご参加、ありがとうございます"
              : "プロフィールを充実させませんか？"}
          </p>
        </div>

        {/* アバター（ヘッダーとカードの境目に配置） */}
        <div className="flex justify-center -mt-8 mb-4 relative z-10">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="relative group"
          >
            <Avatar name={name || userName} avatarUrl={previewUrl} size="xl" />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploading ? (
                <span className="text-white text-xs">…</span>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 -mt-2 mb-5">写真をタップして設定</p>

        {done ? (
          <div className="text-center pb-8">
            <div className="text-3xl mb-2">✨</div>
            <p className="font-bold text-gray-800">保存しました！</p>
          </div>
        ) : (
          <div className="px-8 pb-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">名前</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                一言メッセージ
                <span className="text-gray-400 font-normal ml-2">（任意）</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none"
                placeholder="コーチングとの出会いや、大切にしていることなど"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              {saving ? "保存中…" : "保存してはじめる"}
            </button>
            <button
              onClick={handleSkip}
              className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
            >
              あとで設定する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
