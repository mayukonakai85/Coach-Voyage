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
  invitedAt: Date | null;
  joinedMonth: string | null;
};

export function MemberRow({ member, currentUserId }: { member: Member; currentUserId: string }) {
  const router = useRouter();
  const isMe = member.id === currentUserId;

  const [title, setTitle] = useState(member.title ?? "");
  const [editingTitle, setEditingTitle] = useState(false);
  const [joinedMonth, setJoinedMonth] = useState(member.joinedMonth ?? "");
  const [editingMonth, setEditingMonth] = useState(false);
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

  async function saveJoinedMonth(value: string) {
    setJoinedMonth(value);
    await patch({ joinedMonth: value });
    setEditingMonth(false);
  }

  function formatMonth(ym: string) {
    const [y, m] = ym.split("-");
    return `${y}年${parseInt(m)}月`;
  }

  return (
    <tr className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
      {/* 名前・メール */}
      <td className="pl-5 pr-3 py-3">
        <p className="font-medium text-gray-900 text-sm truncate">{member.name}</p>
        <p className="text-xs text-gray-400 truncate">{member.email}</p>
      </td>

      {/* 役職 */}
      <td className="px-3 py-3 hidden sm:table-cell">
        {editingTitle ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditingTitle(false); }}
              className="text-xs border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-400"
              placeholder="役職名"
              autoFocus
            />
            <button onClick={saveTitle} disabled={saving} className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0">保存</button>
            <button onClick={() => setEditingTitle(false)} className="text-xs text-gray-400 hover:text-gray-600 shrink-0">×</button>
          </div>
        ) : (
          <button onClick={() => setEditingTitle(true)} className="group text-left w-full">
            {member.title ? (
              <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full truncate block w-fit max-w-full">{member.title}</span>
            ) : (
              <span className="text-xs text-gray-300 group-hover:text-gray-400">+ 追加</span>
            )}
          </button>
        )}
      </td>

      {/* 権限 */}
      <td className="px-3 py-3 hidden md:table-cell">
        <select
          value={member.role}
          disabled={isMe || saving}
          onChange={(e) => patch({ role: e.target.value })}
          className={`text-xs border rounded px-2 py-1.5 font-medium focus:outline-none transition-colors w-full ${
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

      {/* 入会月 */}
      <td className="px-3 py-3 hidden lg:table-cell">
        {editingMonth ? (
          <input
            type="month"
            value={joinedMonth}
            onChange={(e) => saveJoinedMonth(e.target.value)}
            onBlur={() => setEditingMonth(false)}
            className="text-xs border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-400"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditingMonth(true)}
            className="group text-left w-full"
          >
            {joinedMonth ? (
              <span className="text-xs text-gray-700">{formatMonth(joinedMonth)}</span>
            ) : (
              <span className="text-xs text-gray-300 group-hover:text-gray-400">+ 入会月を追加</span>
            )}
          </button>
        )}
      </td>

      {/* 招待 */}
      <td className="px-3 py-3">
        <div className="flex justify-end">
          <InviteButton memberId={member.id} memberName={member.name} memberEmail={member.email} invitedAt={member.invitedAt} />
        </div>
      </td>

      {/* ステータス */}
      <td className="pl-3 pr-5 py-3">
        <div className="flex justify-end">
          <select
            value={member.isActive ? "active" : "inactive"}
            disabled={isMe || saving}
            onChange={(e) => patch({ isActive: e.target.value === "active" })}
            className={`text-xs border rounded-lg px-2 py-1.5 font-semibold focus:outline-none transition-colors disabled:opacity-50 cursor-pointer w-full ${
              member.isActive
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-gray-100 text-gray-500"
            }`}
          >
            <option value="active">会員</option>
            <option value="inactive">退会済</option>
          </select>
        </div>
      </td>
    </tr>
  );
}
