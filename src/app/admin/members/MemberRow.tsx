"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InviteButton } from "./InviteButton";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  title: string | null;
  isActive: boolean;
  createdAt: Date;
};

export function MemberRow({ member, currentUserId }: { member: Member; currentUserId: string }) {
  const router = useRouter();
  const isMe = member.id === currentUserId;

  const [title, setTitle] = useState(member.title ?? "");
  const [editingTitle, setEditingTitle] = useState(false);
  const [saving, setSaving] = useState(false);

  async function patch(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? "更新に失敗しました");
      } else {
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function saveTitle() {
    await patch({ title });
    setEditingTitle(false);
  }

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
      {/* 名前・メール */}
      <td className="px-5 py-4">
        <p className="font-medium text-gray-900 text-sm">{member.name}</p>
        <p className="text-xs text-gray-400">{member.email}</p>
      </td>

      {/* 役職 */}
      <td className="px-5 py-4 hidden sm:table-cell">
        {editingTitle ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditingTitle(false); }}
              className="text-xs border border-gray-300 rounded px-2 py-1 w-32 focus:outline-none focus:border-blue-400"
              placeholder="役職名"
              autoFocus
            />
            <button onClick={saveTitle} disabled={saving} className="text-xs text-blue-600 hover:text-blue-800 font-medium">保存</button>
            <button onClick={() => setEditingTitle(false)} className="text-xs text-gray-400 hover:text-gray-600">×</button>
          </div>
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="group flex items-center gap-1 text-left"
          >
            {member.title ? (
              <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">{member.title}</span>
            ) : (
              <span className="text-xs text-gray-300 group-hover:text-gray-400">+ 役職を追加</span>
            )}
          </button>
        )}
      </td>

      {/* 権限 */}
      <td className="px-5 py-4 hidden md:table-cell">
        <select
          value={member.role}
          disabled={isMe || saving}
          onChange={(e) => patch({ role: e.target.value })}
          className={`text-xs border rounded px-2 py-1 font-medium focus:outline-none transition-colors ${
            member.role === "ADMIN"
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-gray-50 text-gray-600"
          } disabled:opacity-50`}
        >
          <option value="MEMBER">一般会員</option>
          <option value="ADMIN">管理者</option>
        </select>
        {isMe && <p className="text-xs text-gray-300 mt-0.5">（自分）</p>}
      </td>

      {/* 登録日 */}
      <td className="px-5 py-4 text-xs text-gray-400 hidden lg:table-cell">
        {new Date(member.createdAt).toLocaleDateString("ja-JP")}
      </td>

      {/* 招待・操作 */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2 justify-end flex-wrap">
          <InviteButton memberId={member.id} memberName={member.name} memberEmail={member.email} />
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${member.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
            {member.isActive ? "有効" : "無効"}
          </span>
          <button
            disabled={saving}
            onClick={() => patch({ isActive: !member.isActive })}
            className={`text-xs py-1 px-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
              member.isActive ? "bg-red-50 hover:bg-red-100 text-red-700" : "bg-green-50 hover:bg-green-100 text-green-700"
            }`}
          >
            {saving ? "…" : member.isActive ? "無効化" : "有効化"}
          </button>
        </div>
      </td>
    </tr>
  );
}
