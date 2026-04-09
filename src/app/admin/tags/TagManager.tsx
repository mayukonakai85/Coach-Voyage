"use client";

import { useState } from "react";

type Tag = { id: string; name: string; sortOrder: number; _count: { users: number } };

export function TagManager({ initialTags }: { initialTags: Tag[] }) {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        const tag = await res.json();
        setTags(prev => [...prev, { ...tag, _count: { users: 0 } }]);
        setNewName("");
      } else {
        const data = await res.json();
        setError(data.error ?? "追加に失敗しました");
      }
    } finally {
      setAdding(false);
    }
  }

  function startEdit(tag: Tag) {
    setEditingId(tag.id);
    setEditName(tag.name);
    setError("");
  }

  async function handleEdit(id: string) {
    if (!editName.trim()) return;
    setError("");
    const res = await fetch(`/api/admin/tags/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    if (res.ok) {
      setTags(prev => prev.map(t => t.id === id ? { ...t, name: editName.trim() } : t));
      setEditingId(null);
    } else {
      const data = await res.json();
      setError(data.error ?? "更新に失敗しました");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`タグ「${name}」を削除しますか？\n関連する会員データも削除されます。`)) return;
    setError("");
    const res = await fetch(`/api/admin/tags/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTags(prev => prev.filter(t => t.id !== id));
    } else {
      setError("削除に失敗しました");
    }
  }

  return (
    <div className="max-w-2xl">
      {/* 新規追加 */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">タグを追加</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="タグ名を入力"
            className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300"
          />
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            {adding ? "追加中…" : "追加"}
          </button>
        </form>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {/* タグ一覧 */}
      <div className="card p-6">
        <h2 className="font-bold text-gray-800 mb-4">タグ一覧 <span className="text-gray-400 font-normal text-sm">({tags.length}件)</span></h2>
        {tags.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">タグがまだありません</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {tags.map(tag => (
              <li key={tag.id} className="py-3 flex items-center gap-3">
                {editingId === tag.id ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleEdit(tag.id)}
                      className="flex-1 rounded-lg border border-blue-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                      autoFocus
                    />
                    <button
                      onClick={() => handleEdit(tag.id)}
                      disabled={!editName.trim()}
                      className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5"
                    >
                      キャンセル
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium text-gray-800">{tag.name}</span>
                    <span className="text-xs text-gray-400 mr-2">{tag._count.users}人</span>
                    <button
                      onClick={() => startEdit(tag)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id, tag.name)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      削除
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
