"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar } from "@/components/Avatar";

type Tag = { id: string; name: string };

type Props = {
  loginCount: number;
  userName: string;
  avatarUrl: string | null;
};

export function WelcomePopup({ loginCount, userName, avatarUrl }: Props) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(1); // 1, 2, 3
  const [tags, setTags] = useState<Tag[]>([]);

  // Step1
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Step2
  const [name, setName] = useState(userName);
  const [bio, setBio] = useState("");

  // Step3
  const [learningSince, setLearningSince] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem("welcome_shown");
    if (shown) return;
    if (loginCount === 1 || loginCount === 3) {
      setVisible(true);
      sessionStorage.setItem("welcome_shown", "1");
      // タグ一覧取得
      fetch("/api/tags").then(r => r.json()).then(setTags).catch(() => {});
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

  function toggleTag(id: string) {
    setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  }

  async function handleFinish() {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio, learningSince, tagIds: selectedTags }),
    });
    setSaving(false);
    setDone(true);
    setTimeout(() => setVisible(false), 1500);
  }

  function handleSkip() {
    setVisible(false);
  }

  if (!visible) return null;

  const totalSteps = 3;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* ヘッダー */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-8 pt-7 pb-8 text-center">
          <div className="text-3xl mb-2">{loginCount === 1 ? "🎉" : "👋"}</div>
          <h2 className="text-xl font-black text-white">
            {loginCount === 1 ? `${name}さん、ようこそ！` : `お久しぶりです、${name}さん！`}
          </h2>
          <p className="text-blue-200 text-xs mt-1">
            {loginCount === 1 ? "Coach Voyage へのご参加、ありがとうございます" : "プロフィールを完成させましょう"}
          </p>
          {/* ステップインジケーター */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1,2,3].map(s => (
              <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? "w-6 bg-white" : s < step ? "w-3 bg-white/60" : "w-3 bg-white/30"}`} />
            ))}
          </div>
        </div>

        <div className="px-8 py-6">
          {done ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">✨</div>
              <p className="font-bold text-gray-800 text-lg">設定が完了しました！</p>
              <p className="text-sm text-gray-500 mt-1">楽しい学びを！</p>
            </div>
          ) : step === 1 ? (
            /* Step 1: プロフィール写真 */
            <div>
              <p className="font-bold text-gray-800 mb-1">プロフィール写真を登録しましょう</p>
              <p className="text-xs text-gray-400 mb-5">写真またはイラストをアップロードできます</p>
              <div className="flex justify-center mb-6">
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="relative group">
                  <Avatar name={name} avatarUrl={previewUrl} size="xl" />
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {uploading ? <span className="text-white text-xs">…</span> : (
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mb-6">タップして写真を選択</p>
              <button onClick={() => setStep(2)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                次へ →
              </button>
              <button onClick={handleSkip} className="w-full text-xs text-gray-400 hover:text-gray-600 py-2 mt-2 transition-colors">
                あとで登録する
              </button>
            </div>
          ) : step === 2 ? (
            /* Step 2: 一言メッセージ */
            <div>
              <p className="font-bold text-gray-800 mb-1">一言を書いてみましょう</p>
              <p className="text-xs text-gray-400 mb-5">メンバーに表示されます。そのまま送信もOK！</p>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">名前</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">一言メッセージ</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none"
                  placeholder="よろしくお願いします"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  ← 戻る
                </button>
                <button onClick={() => setStep(3)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                  次へ →
                </button>
              </div>
              <button onClick={handleSkip} className="w-full text-xs text-gray-400 hover:text-gray-600 py-2 mt-2 transition-colors">
                あとで設定する
              </button>
            </div>
          ) : (
            /* Step 3: アンケート */
            <div>
              <p className="font-bold text-gray-800 mb-1">あなたについて教えてください</p>
              <p className="text-xs text-gray-400 mb-4">運営のみ閲覧できます</p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">学習開始時期</label>
                <input
                  type="text"
                  value={learningSince}
                  onChange={e => setLearningSince(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300"
                  placeholder="例：2024年4月"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">興味関心タグ <span className="text-gray-400 font-normal">（複数選択可）</span></label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
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

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  ← 戻る
                </button>
                <button onClick={handleFinish} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                  {saving ? "保存中…" : "完了！"}
                </button>
              </div>
              <button onClick={handleSkip} className="w-full text-xs text-gray-400 hover:text-gray-600 py-2 mt-2 transition-colors">
                あとで設定する
              </button>
            </div>
          )}
        </div>

        {/* ステップ表示 */}
        {!done && (
          <div className="px-8 pb-4 text-center">
            <p className="text-xs text-gray-300">ステップ {step} / {totalSteps}</p>
          </div>
        )}
      </div>
    </div>
  );
}
