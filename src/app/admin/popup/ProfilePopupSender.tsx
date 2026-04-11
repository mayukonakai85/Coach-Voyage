"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  name: string | null;
  email: string;
  loginCount: number;
  showProfilePopup: boolean;
};

export function ProfilePopupSender({ members }: { members: Member[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === members.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(members.map((m) => m.id)));
    }
  }

  async function handleSend() {
    if (selected.size === 0) return;
    setSending(true);
    try {
      await fetch("/api/admin/popup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "profile", memberIds: Array.from(selected) }),
      });
      setSent(true);
      setSelected(new Set());
      setTimeout(() => setSent(false), 2000);
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        4回目以降のログイン時にプロフィール記入を促すポップアップを表示するメンバーを選択してください。
      </p>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-3 border-b border-gray-200">
          <input
            type="checkbox"
            checked={selected.size === members.length && members.length > 0}
            onChange={toggleAll}
            className="rounded border-gray-300 text-blue-600"
          />
          <span className="text-xs font-semibold text-gray-600">全員選択</span>
          <span className="ml-auto text-xs text-gray-400">{selected.size}名選択中</span>
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
          {members.map((member) => (
            <label
              key={member.id}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.has(member.id)}
                onChange={() => toggle(member.id)}
                className="rounded border-gray-300 text-blue-600"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{member.name ?? "（名前未設定）"}</p>
                <p className="text-xs text-gray-400 truncate">{member.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {member.showProfilePopup && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">表示予定</span>
                )}
                <span className="text-xs text-gray-400">ログイン{member.loginCount}回</span>
              </div>
            </label>
          ))}
          {members.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">アクティブなメンバーがいません</p>
          )}
        </div>
      </div>

      <button
        onClick={handleSend}
        disabled={selected.size === 0 || sending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
      >
        {sending ? "送信中…" : sent ? "設定しました ✓" : `選択した ${selected.size} 名に次回ログイン時表示`}
      </button>
    </div>
  );
}
