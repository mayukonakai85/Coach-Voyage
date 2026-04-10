"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar } from "@/components/Avatar";

type CommentData = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl?: string | null };
  likes: { userId: string }[];
  replies: CommentData[];
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function CommentItem({
  comment,
  currentUserId,
  currentUserRole,
  videoId,
  onDelete,
  onReplyPosted,
  depth = 0,
}: {
  comment: CommentData;
  currentUserId: string;
  currentUserRole: string;
  videoId: string;
  onDelete: (id: string) => void;
  onReplyPosted: (parentId: string, reply: CommentData) => void;
  depth?: number;
}) {
  const isOwn = comment.user.id === currentUserId;
  const isAdmin = currentUserRole === "ADMIN";
  const liked = comment.likes.some((l) => l.userId === currentUserId);
  const [likeCount, setLikeCount] = useState(comment.likes.length);
  const [isLiked, setIsLiked] = useState(liked);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [posting, setPosting] = useState(false);

  async function handleLike() {
    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId: comment.id }),
    });
    if (res.ok) {
      const data = await res.json();
      setIsLiked(data.liked);
      setLikeCount((c) => data.liked ? c + 1 : c - 1);
    }
  }

  async function handleReply() {
    if (!replyText.trim() || posting) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText, parentId: comment.id }),
      });
      if (res.ok) {
        const reply = await res.json();
        onReplyPosted(comment.id, reply);
        setReplyText("");
        setShowReply(false);
      }
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className={depth > 0 ? "ml-8 mt-2" : ""}>
      <div className="flex gap-2.5 group">
        <Avatar name={comment.user.name} avatarUrl={comment.user.avatarUrl ?? null} size="sm" />
        <div className="flex-1 min-w-0 bg-white rounded-xl px-3 py-2.5 shadow-sm border border-blue-50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-xs text-gray-700">{comment.user.name}</span>
            <span className="text-xs text-gray-300">{formatDate(comment.createdAt)}</span>
            {(isOwn || isAdmin) && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-xs text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-auto"
              >
                削除
              </button>
            )}
          </div>
          <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words leading-relaxed">{comment.content}</p>
          <div className="flex items-center gap-3 mt-2">
            {/* いいね */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs transition-colors ${isLiked ? "text-red-500" : "text-gray-300 hover:text-red-400"}`}
            >
              <span className="text-sm">{isLiked ? "❤️" : "🤍"}</span>
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>
            {/* 返信（ネストは1段まで） */}
            {depth === 0 && (
              <button
                onClick={() => setShowReply((v) => !v)}
                className="text-xs text-gray-400 hover:text-blue-500 transition-colors"
              >
                返信
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 返信フォーム */}
      {showReply && (
        <div className="ml-8 mt-2 flex gap-2 items-end">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleReply(); }}
            rows={2}
            placeholder="返信を入力…"
            className="flex-1 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none"
          />
          <div className="flex flex-col gap-1">
            <button
              onClick={handleReply}
              disabled={!replyText.trim() || posting}
              className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs px-3 py-2 rounded-xl transition-colors"
            >
              {posting ? "…" : "返信"}
            </button>
            <button onClick={() => setShowReply(false)} className="text-xs text-gray-400 hover:text-gray-600 text-center">閉じる</button>
          </div>
        </div>
      )}

      {/* 返信一覧 */}
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          videoId={videoId}
          onDelete={onDelete}
          onReplyPosted={onReplyPosted}
          depth={1}
        />
      ))}
    </div>
  );
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
  const [comments, setComments] = useState<CommentData[]>([]);
  const [text, setText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/videos/${videoId}/comments`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setComments(data); });
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

  function handleDelete(commentId: string) {
    fetch(`/api/videos/${videoId}/comments/${commentId}`, { method: "DELETE" });
    setComments((prev) => prev
      .filter((c) => c.id !== commentId)
      .map((c) => ({ ...c, replies: c.replies?.filter((r) => r.id !== commentId) ?? [] }))
    );
  }

  function handleReplyPosted(parentId: string, reply: CommentData) {
    setComments((prev) => prev.map((c) =>
      c.id === parentId ? { ...c, replies: [...(c.replies ?? []), reply] } : c
    ));
  }

  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0);

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </span>
        <h2 className="font-bold text-gray-800">みんなのコメント</h2>
        {totalCount > 0 && (
          <span className="text-xs font-semibold text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">{totalCount}</span>
        )}
      </div>
      <p className="text-xs text-blue-700/50 mb-4">メンバー全員に公開されます</p>

      {comments.length === 0 ? (
        <div className="text-center py-6 mb-3">
          <p className="text-sm text-gray-400">まだコメントはありません</p>
          <p className="text-xs text-gray-300 mt-1">最初の感想を投稿してみましょう！</p>
        </div>
      ) : (
        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto pr-1">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              videoId={videoId}
              onDelete={handleDelete}
              onReplyPosted={handleReplyPosted}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="flex gap-2 items-end border-t border-blue-100 pt-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost(); }}
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
