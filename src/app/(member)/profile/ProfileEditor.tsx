"use client";

import { useState, useRef } from "react";
import { Avatar } from "@/components/Avatar";

type Profile = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: Date | string;
  _count: { views: number; notes: number; comments: number };
};

export function ProfileEditor({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [email, setEmail] = useState(profile.email);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // パスワード変更
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, email }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const data = await res.json();
        setError(data.error ?? "保存に失敗しました");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSave() {
    if (newPassword !== confirmPassword) {
      setPwError("新しいパスワードが一致しません");
      return;
    }
    setPwSaving(true);
    setPwError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, email, currentPassword, newPassword }),
      });
      if (res.ok) {
        setPwSaved(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPwSaved(false), 2000);
      } else {
        const data = await res.json();
        setPwError(data.error ?? "変更に失敗しました");
      }
    } finally {
      setPwSaving(false);
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/profile/avatar", { method: "POST", body: form });
      if (res.ok) {
        const data = await res.json();
        setAvatarUrl(data.avatarUrl + "?t=" + Date.now()); // キャッシュバスト
      } else {
        const data = await res.json();
        setError(data.error ?? "アップロードに失敗しました");
      }
    } finally {
      setUploading(false);
    }
  }

  const joinedDate = new Date(profile.createdAt).toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto">
      {/* ページヘッダー */}
      <div className="mb-8">
        <p className="text-sm text-blue-600 font-semibold uppercase tracking-widest mb-1">Member Portal</p>
        <h1 className="text-2xl font-bold text-gray-900">マイプロフィール</h1>
      </div>

      {/* アバター＋基本情報 */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 mb-6 text-white flex items-center gap-5">
        {/* アバター（クリックで写真変更） */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="relative group shrink-0"
        >
          <Avatar name={name || profile.name} avatarUrl={avatarUrl} size="xl" />
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploading ? (
              <span className="text-white text-xs font-bold">...</span>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </button>
        <div>
          <p className="text-2xl font-bold leading-tight">{name || profile.name}</p>
          <p className="text-blue-200 text-sm mt-0.5">{profile.email}</p>
          <div className="flex items-center gap-2 mt-2">
            {profile.role === "ADMIN" && (
              <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">管理者</span>
            )}
            <span className="text-xs text-blue-200">{joinedDate} 参加</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400 -mt-3 mb-3 pl-1">↑ 写真をクリックして変更</p>

      {/* アクティビティ */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "視聴動画", value: profile._count.views },
          { label: "ノート", value: profile._count.notes },
          { label: "コメント", value: profile._count.comments },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl bg-white border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-2xl font-black text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* プロフィール編集 */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-5">プロフィールを編集</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">名前</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              自己紹介<span className="text-gray-400 font-normal ml-2">（任意）</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none"
              placeholder="コーチングとの出会いや、大切にしていることなど"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
          >
            {saving ? "保存中…" : saved ? "保存しました ✓" : "保存する"}
          </button>
        </div>
      </div>

      {/* パスワード変更 */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mt-4">
        <h2 className="font-bold text-gray-800 mb-5">パスワードを変更</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">現在のパスワード</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">新しいパスワード（8文字以上）</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">新しいパスワード（確認）</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300"
            />
          </div>
          {pwError && <p className="text-sm text-red-500">{pwError}</p>}
          <button
            onClick={handlePasswordSave}
            disabled={pwSaving || !currentPassword || !newPassword || !confirmPassword}
            className="w-full bg-gray-700 hover:bg-gray-800 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
          >
            {pwSaving ? "変更中…" : pwSaved ? "変更しました ✓" : "パスワードを変更する"}
          </button>
        </div>
      </div>
    </div>
  );
}
