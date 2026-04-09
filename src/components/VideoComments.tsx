"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar } from "@/components/Avatar";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function VideoComments({
  videoId,
  currentUserId,
  currentUserRole,
}: {
  videoId: string;
  currentUserId: string;
  currentUserRole: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/videos/${videoId}/comments`)
      .then((r) => r.json())
      .then(setComments);
  }, [videoId]);

  async function handlePost() {
    if (!text.trim() || isPosting) return;
    setIsPosting(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setText("");
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    } finally {
      setIsPosting(false);
    }
  }

  async function handleDelete(commentId: string) {
    setDeletingId(commentId);
    try {
      await fetch(`/api/videos/${videoId}/comments/${commentId}`, { method: "DELETE" });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-2 mb-1">
        <span className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </span>
        <h2 className="font-bold text-gray-800">みんなのコメント</h2>
        {comments.length > 0 && (
          <span className="text-xs font-semibold text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">{comments.length}</span>
        )}
      </div>
      <p className="text-xs text-blue-700/50 mb-4">メンバー全員に公開されます</p>

      {/* コメント一覧 */}
      {comments.length === 0 ? (
        <div className="text-center py-6 mb-3">
          <p className="text-sm text-gray-400">まだコメントはありません</p>
          <p className="text-xs text-gray-300 mt-1">最初の感想を投稿してみましょう！</p>
        </div>
      ) : (
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
          {comments.map((c) => {
            const isOwn = c.user.id === currentUserId;
            const isAdmin = currentUserRole === "ADMIN";
            return (
              <div key={c.id} className="flex gap-2.5 group">
                <Avatar name={c.user.name} size="sm" />
                <div className="flex-1 min-w-0 bg-white rounded-xl px-3 py-2.5 shadow-sm border border-blue-50">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-gray-700">{c.user.name}</span>
                    <span className="text-xs text-gray-300">{formatDate(c.createdAt)}</span>
                    {(isOwn || isAdmin) && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="text-xs text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-auto"
                      >
                        削除
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words leading-relaxed">{c.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      {/* 投稿フォーム */}
      <div className="flex gap-2 items-end border-t border-blue-100 pt-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
          }}
          rows={2}
          placeholder="感想や質問を書いてみよう（⌘+Enter で送信）"
          className="flex-1 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none"
        />
        <button
          onClick={handlePost}
          disabled={!text.trim() || isPosting}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
        >
          {isPosting ? "…" : "送信"}
        </button>
      </div>
    </div>
  );
}
