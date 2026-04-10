"use client";

import { useState, useRef } from "react";

type Member = { id: string; name: string; avatarUrl: string | null; title: string | null };
type Lecturer = {
  id: string;
  userId: string | null;
  name: string;
  photoUrl: string | null;
  bio: string | null;
  user: { id: string; name: string; avatarUrl: string | null; title: string | null } | null;
};

export function LecturerManager({
  seminarId,
  seminarTitle,
  initialLecturers,
  members,
}: {
  seminarId: string;
  seminarTitle: string;
  initialLecturers: Lecturer[];
  members: Member[];
}) {
  const [lecturers, setLecturers] = useState<Lecturer[]>(initialLecturers);
  const [mode, setMode] = useState<"member" | "external">("member");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [extName, setExtName] = useState("");
  const [extBio, setExtBio] = useState("");
  const [extPhotoUrl, setExtPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const resized = await resizeImage(file, 300);
      const reader = new FileReader();
      reader.onload = () => setExtPhotoUrl(reader.result as string);
      reader.readAsDataURL(resized);
    } finally {
      setUploading(false);
    }
  }

  async function handleAdd() {
    setError("");
    setSaving(true);
    try {
      let body: Record<string, string | null> = {};
      if (mode === "member") {
        if (!selectedMemberId) { setError("メンバーを選択してください"); return; }
        const member = members.find(m => m.id === selectedMemberId)!;
        body = { userId: selectedMemberId, name: member.name };
      } else {
        if (!extName.trim()) { setError("名前を入力してください"); return; }
        body = { name: extName.trim(), bio: extBio.trim() || null, photoUrl: extPhotoUrl };
      }

      const res = await fetch(`/api/admin/seminars/${seminarId}/lecturers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const newLecturer = await res.json();
        setLecturers(prev => [...prev, newLecturer]);
        setSelectedMemberId("");
        setExtName("");
        setExtBio("");
        setExtPhotoUrl(null);
      } else {
        const data = await res.json();
        setError(data.error ?? "追加に失敗しました");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(lecturerId: string) {
    await fetch(`/api/admin/seminars/${seminarId}/lecturers/${lecturerId}`, { method: "DELETE" });
    setLecturers(prev => prev.filter(l => l.id !== lecturerId));
  }

  const availableMembers = members.filter(m => !lecturers.some(l => l.userId === m.id));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-orange-600 font-semibold uppercase tracking-widest mb-1">イベント管理</p>
        <h1 className="text-2xl font-bold text-gray-900">講師管理</h1>
        <p className="text-sm text-gray-500 mt-1">{seminarTitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 追加フォーム */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-4">講師を追加</h2>

          {/* モード切替 */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setMode("member")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "member" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              メンバーから選ぶ
            </button>
            <button
              type="button"
              onClick={() => setMode("external")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "external" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              外部講師を登録
            </button>
          </div>

          {mode === "member" ? (
            <div className="space-y-3">
              <select
                value={selectedMemberId}
                onChange={e => setSelectedMemberId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:border-blue-400 focus:outline-none"
              >
                <option value="">メンバーを選択</option>
                {availableMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}{m.title ? `（${m.title}）` : ""}</option>
                ))}
              </select>
              {selectedMemberId && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  {(() => {
                    const m = members.find(m => m.id === selectedMemberId)!;
                    return (
                      <>
                        {m.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.avatarUrl} alt={m.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">{m.name.charAt(0)}</div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-800">{m.name}</p>
                          {m.title && <p className="text-xs text-gray-500">{m.title}</p>}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* 外部講師写真 */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-blue-400 flex items-center justify-center shrink-0 transition-colors overflow-hidden"
                >
                  {extPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={extPhotoUrl} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </button>
                <div>
                  <p className="text-sm font-medium text-gray-700">プロフィール写真</p>
                  <p className="text-xs text-gray-400">{uploading ? "処理中…" : "クリックして写真を選択"}</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">名前 *</label>
                <input
                  type="text"
                  value={extName}
                  onChange={e => setExtName(e.target.value)}
                  placeholder="例：田中 太郎"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">紹介文（任意）</label>
                <textarea
                  value={extBio}
                  onChange={e => setExtBio(e.target.value)}
                  rows={3}
                  placeholder="肩書き・経歴など"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <button
            onClick={handleAdd}
            disabled={saving}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
          >
            {saving ? "追加中…" : "講師を追加"}
          </button>
        </div>

        {/* 登録済み講師一覧 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-4">登録済み講師 {lecturers.length > 0 && <span className="text-gray-400 font-normal text-sm">({lecturers.length}名)</span>}</h2>
          {lecturers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">まだ講師が登録されていません</p>
          ) : (
            <ul className="space-y-3">
              {lecturers.map(l => {
                const photo = l.user?.avatarUrl ?? l.photoUrl;
                return (
                  <li key={l.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt={l.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0">{l.name.charAt(0)}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{l.name}</p>
                      {l.user?.title && <p className="text-xs text-gray-500">{l.user.title}</p>}
                      {l.bio && <p className="text-xs text-gray-400 truncate">{l.bio}</p>}
                      {l.userId && <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">メンバー</span>}
                      {!l.userId && <span className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">外部講師</span>}
                    </div>
                    <button
                      onClick={() => handleDelete(l.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors shrink-0 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
