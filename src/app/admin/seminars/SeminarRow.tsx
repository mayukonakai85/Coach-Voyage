"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SeminarForm } from "./SeminarForm";

type Seminar = {
  id: string;
  title: string;
  scheduledAt: Date;
  zoomUrl: string | null;
  isNext: boolean;
};

export function SeminarRow({ seminar }: { seminar: Seminar }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`「${seminar.title}」を削除しますか？`)) return;
    setIsDeleting(true);
    await fetch(`/api/admin/seminars/${seminar.id}`, { method: "DELETE" });
    router.refresh();
  }

  const dateStr = new Date(seminar.scheduledAt).toLocaleString("ja-JP", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  if (isEditing) {
    return (
      <tr>
        <td colSpan={3} className="px-6 py-4">
          <SeminarForm initialData={{ ...seminar, scheduledAt: new Date(seminar.scheduledAt) }} onCancel={() => setIsEditing(false)} />
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {seminar.isNext && (
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">次回</span>
          )}
          <div>
            <p className="font-medium text-gray-900">{seminar.title}</p>
            <p className="text-sm text-gray-500">{dateStr}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 hidden sm:table-cell">
        {seminar.zoomUrl ? (
          <a href={seminar.zoomUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline truncate max-w-xs block">
            {seminar.zoomUrl}
          </a>
        ) : (
          <span className="text-sm text-gray-400">未設定</span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => setIsEditing(true)} className="btn-secondary text-sm py-1.5 px-3">編集</button>
          <button onClick={handleDelete} disabled={isDeleting} className="btn-danger text-sm py-1.5 px-3">削除</button>
        </div>
      </td>
    </tr>
  );
}
