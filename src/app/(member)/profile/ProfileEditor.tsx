"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/Avatar";

type Tag = { id: string; name: string };

type Profile = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: Date | string;
  learningSince: string | null;
  contentRequest: string | null;
  _count: { views: number; notes: number; comments: number };
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div>
          <p className="font-bold text-gray-800 text-sm">{title}</p>
          {!open && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ml-4 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-50">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProfileEditor({
  profile,
  allTags,
  initialTagIds,
}: {
  profile: Profile;
  allTags: Tag[];
  initialTagIds: string[];
}) {
  const { update: updateSession } = useSession();
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [email, setEmail] = useState(profile.email);
  const [learningSince, setLearningSince] = useState(profile.learningSince ?? "");
  const parsedRequest = (() => {
    try { return profile.contentRequest ? JSON.parse(profile.contentRequest) : {}; }
    catch { return {}; }
  })();
  const [requestType, setRequestType] = useState<string>(parsedRequest.type ?? "");
  const [requestTheme, setRequestTheme] = useState<string>(parsedRequest.theme ?? "");
  const [requestDetail, setRequestDetail] = useState<string>(parsedRequest.detail ?? "");
  const [requestSaved, setRequestSaved] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTagIds);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

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
        body: JSON.stringify({
          name, bio, email, learningSince, tagIds: selectedTags,
          contentRequest: (requestType || requestTheme || requestDetail)
            ? JSON.stringify({ type: requestType, theme: requestTheme, detail: requestDetail })
            : null,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        await updateSession({ name });
      } else {
        const data = await res.json();
        setError(data.error ?? "保存に失敗しました");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleRequestSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, bio, email, learningSince,
          contentRequest: (requestType || requestTheme || requestDetail)
            ? JSON.stringify({ type: requestType, theme: requestTheme, detail: requestDetail })
            : null,
        }),
      });
      if (res.ok) {
        setRequestSaved(true);
      } else {
        const data = await res.json();
        setError(data.error ?? "送信に失敗しました");
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
      const resizedBlob = await resizeImage(file, 150);
      const form = new FormData();
      form.append("file", resizedBlob, "avatar.jpg");
      const res = await fetch("/api/profile/avatar", { method: "POST", body: form });
      if (res.ok) {
        const data = await res.json();
        setAvatarUrl(data.avatarUrl);
        await updateSession({ avatarUrl: data.avatarUrl });
      } else {
        let errMsg = "アップロードに失敗しました";
        try {
          const data = await res.json();
          if (data.error) errMsg = data.error;
        } catch {}
        setError(errMsg);
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setUploading(false);
    }
  }

  function resizeImage(file: File, maxSize: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("リサイズ失敗"));
        }, "image/jpeg", 0.85);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  function toggleTag(id: string) {
    setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  }

  const joinedDate = new Date(profile.createdAt).toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric",
  });

  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-2xl mx-auto">
      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">マイページ</h1>
      </div>

      {/* アバター＋基本情報 */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 mb-6 text-white flex items-center gap-5">
        <div className="shrink-0 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative group"
          >
            <Avatar name={name || profile.name} avatarUrl={avatarUrl} size="xl" />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-xs text-blue-200 hover:text-white underline underline-offset-2 transition-colors"
          >
            {uploading ? "アップロード中…" : "写真を変更"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
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

      {/* 折りたたみセクション */}
      <div className="space-y-3">
        {/* プロフィール編集 */}
        <Section title="プロフィールを編集" description="名前・メールアドレス・自己紹介・興味関心タグなどを変更できます">
          <div className="space-y-4 mt-2">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                コーチング学習開始時期<span className="text-gray-400 font-normal ml-2">（任意）</span>
              </label>
              <select
                value={learningSince}
                onChange={(e) => setLearningSince(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
              >
                <option value="">選択してください</option>
                {Array.from({ length: currentYear - 2010 }, (_, i) => currentYear - i).map(y => (
                  <option key={y} value={String(y)}>{y}年</option>
                ))}
                <option value="2010">2010年以前</option>
              </select>
            </div>
            {allTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  興味関心タグ
                  <span className="text-gray-400 font-normal ml-2">（複数選択可）</span>
                  <span className="text-xs text-gray-400 font-normal ml-2">興味・関心を登録すると、今後のセミナー内容やコンテンツ制作に活かされます</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                        selectedTags.includes(tag.id)
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
            >
              {saving ? "保存中…" : saved ? "保存しました ✓" : "保存する"}
            </button>
          </div>
        </Section>

        {/* コンテンツリクエスト */}
        <Section title="コンテンツリクエスト" description="セミナーやショート動画で扱ってほしいテーマをリクエストできます">
          {requestSaved ? (
            <div className="mt-2 rounded-xl bg-blue-50 border border-blue-100 px-5 py-8 text-center">
              <p className="text-2xl mb-2">🎉</p>
              <p className="font-bold text-blue-700 text-sm">リクエストを受け取りました！</p>
              <p className="text-xs text-blue-500 mt-1">コンテンツ制作に活かします。ありがとうございます。</p>
              <button
                onClick={() => setRequestSaved(false)}
                className="mt-4 text-xs text-blue-500 hover:underline"
              >
                別のリクエストを送る
              </button>
            </div>
          ) : (
            <div className="mt-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">種別</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
                >
                  <option value="">選択してください</option>
                  <option value="セミナー">セミナー</option>
                  <option value="動画">動画</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">テーマ</label>
                <textarea
                  value={requestTheme}
                  onChange={(e) => setRequestTheme(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none"
                  placeholder="例：コーチングスキルを日常のコミュニケーションに活かす方法"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">知りたいこと</label>
                <textarea
                  value={requestDetail}
                  onChange={(e) => setRequestDetail(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none"
                  placeholder="例：相手の話を引き出すための質問の仕方や、職場での実践例を知りたい"
                />
              </div>
              <button
                onClick={handleRequestSave}
                disabled={saving || (!requestType && !requestTheme && !requestDetail)}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
              >
                {saving ? "送信中…" : "リクエストを送る"}
              </button>
            </div>
          )}
        </Section>

        {/* パスワード変更 */}
        <Section title="パスワードを変更" description="現在のパスワードを確認してから新しいパスワードに変更できます">
          <div className="mt-2 space-y-4">
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
        </Section>
      </div>
    </div>
  );
}
