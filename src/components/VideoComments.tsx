"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar } from "@/components/Avatar";

type Member = { id: string; name: string; avatarUrl: string | null };

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

// @名前 をハイライト表示
function renderWithMentions(content: string) {
  const parts = content.split(/(@\S+)/g);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="text-blue-600 font-semibold">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// メンション対応テキストエリア
function MentionTextarea({
  value,
  onChange,
  onKeyDown,
  placeholder,
  rows,
  className,
  members,
}: {
  value: string;
  onChange: (val: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  members: Member[];
}) {
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState(0);
  const [menuIndex, setMenuIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filtered = mentionQuery !== null
    ? members.filter(m => m.name.toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 6)
    : [];

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    const cursor = e.target.selectionStart ?? 0;
    onChange(val);

    // カーソル位置より前の文字列で @xxx を探す
    const before = val.slice(0, cursor);
    const match = before.match(/@(\S*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setMentionStart(cursor - match[0].length);
      setMenuIndex(0);
    } else {
      setMentionQuery(null);
    }
  }

  function handleSelect(member: Member) {
    const cursor = textareaRef.current?.selectionStart ?? 0;
    const before = value.slice(0, mentionStart);
    const after = value.slice(cursor);
    const inserted = `@${member.name} `;
    onChange(before + inserted + after);
    setMentionQuery(null);
    setTimeout(() => {
      const pos = mentionStart + inserted.length;
      textareaRef.current?.setSelectionRange(pos, pos);
      textareaRef.current?.focus();
    }, 0);
  }

  function handleKeyDownInner(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionQuery !== null && filtered.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setMenuIndex(i => Math.min(i + 1, filtered.length - 1)); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setMenuIndex(i => Math.max(i - 1, 0)); return; }
      if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) { e.preventDefault(); handleSelect(filtered[menuIndex]); return; }
      if (e.key === "Escape") { setMentionQuery(null); return; }
    }
    onKeyDown?.(e);
  }

  return (
    <div className="relative flex-1">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDownInner}
        rows={rows}
        placeholder={placeholder}
        className={className}
      />
      {mentionQuery !== null && filtered.length > 0 && (
        <div className="absolute bottom-full left-0 mb-1 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50 overflow-hidden">
          <p className="text-xs text-gray-400 px-3 py-1">メンバーを選択</p>
          {filtered.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(m); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${i === menuIndex ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}`}
            >
              {m.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.avatarUrl} alt={m.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-400 text-white text-xs font-bold flex items-center justify-center shrink-0">{m.name.charAt(0)}</div>
              )}
              <span className="text-sm font-medium truncate">{m.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  currentUserId,
  currentUserRole,
  videoId,
  members,
  onDelete,
  onEdit,
  onReplyPosted,
  depth = 0,
}: {
  comment: CommentData;
  currentUserId: string;
  currentUserRole: string;
  videoId: string;
  members: Member[];
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
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
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [saving, setSaving] = useState(false);

  async function handleEdit() {
    if (!editText.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/comments/${comment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editText }),
      });
      if (res.ok) {
        onEdit(comment.id, editText.trim());
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

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
            <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {isOwn && !editing && (
                <button
                  onClick={() => { setEditText(comment.content); setEditing(true); }}
                  className="text-xs text-gray-300 hover:text-blue-400 transition-colors"
                >
                  編集
                </button>
              )}
              {(isOwn || isAdmin) && (
                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-xs text-gray-300 hover:text-red-400 transition-colors"
                >
                  削除
                </button>
              )}
            </div>
          </div>

          {editing ? (
            <div className="mt-1.5 space-y-1.5">
              <MentionTextarea
                value={editText}
                onChange={setEditText}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleEdit();
                  if (e.key === "Escape") setEditing(false);
                }}
                rows={2}
                className="w-full rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none"
                members={members}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEdit}
                  disabled={!editText.trim() || saving}
                  className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold px-3 py-1 rounded-lg transition-colors"
                >
                  {saving ? "保存中…" : "保存"}
                </button>
                <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:text-gray-600">
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words leading-relaxed">
              {renderWithMentions(comment.content)}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs transition-colors ${isLiked ? "text-red-500" : "text-gray-300 hover:text-red-400"}`}
            >
              <span className="text-sm">{isLiked ? "❤️" : "🤍"}</span>
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>
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

      {showReply && (
        <div className="ml-8 mt-2 flex gap-2 items-end">
          <MentionTextarea
            value={replyText}
            onChange={setReplyText}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleReply(); }}
            rows={2}
            placeholder="返信を入力… （@で メンション）"
            className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none"
            members={members}
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

      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          videoId={videoId}
          members={members}
          onDelete={onDelete}
          onEdit={onEdit}
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
  const [members, setMembers] = useState<Member[]>([]);
  const [text, setText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/videos/${videoId}/comments`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setComments(data); });
    fetch("/api/members")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setMembers(data); });
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
    setComments((prev) =>
      prev
        .filter((c) => c.id !== commentId)
        .map((c) => ({ ...c, replies: c.replies?.filter((r) => r.id !== commentId) ?? [] }))
    );
  }

  function handleEdit(commentId: string, content: string) {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, content }
          : { ...c, replies: c.replies?.map((r) => r.id === commentId ? { ...r, content } : r) ?? [] }
      )
    );
  }

  function handleReplyPosted(parentId: string, reply: CommentData) {
    setComments((prev) =>
      prev.map((c) => c.id === parentId ? { ...c, replies: [...(c.replies ?? []), reply] } : c)
    );
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
      <p className="text-xs text-blue-700/50 mb-4">メンバー全員に公開されます・@ でメンション可</p>

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
              members={members}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onReplyPosted={handleReplyPosted}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="flex gap-2 items-end border-t border-blue-100 pt-4">
        <MentionTextarea
          value={text}
          onChange={setText}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost(); }}
          rows={2}
          placeholder="感想や質問を書いてみよう（@ でメンション・⌘+Enter で送信）"
          className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none"
          members={members}
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
