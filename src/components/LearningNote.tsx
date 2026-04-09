"use client";

import { useState, useEffect, useRef } from "react";

export function LearningNote({ videoId, initialContent }: { videoId: string; initialContent: string }) {
  const [content, setContent] = useState(initialContent);
  const [saved, setSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 入力のたびに3秒後に自動保存
  useEffect(() => {
    if (saved) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(content), 3000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  async function save(text: string) {
    setIsSaving(true);
    try {
      await fetch(`/api/videos/${videoId}/note`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      setSaved(true);
    } finally {
      setIsSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    setSaved(false);
  }

  async function handleBlur() {
    if (saved) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    await save(content);
  }

  return (
    <div className="rounded-2xl border border-yellow-100 bg-yellow-50/60 p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-yellow-400 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm9-1a1 1 0 100 2 1 1 0 000-2zm3 10H9v-2h6v2zm0-4H9v-2h6v2z"/>
            </svg>
          </span>
          マイノート
        </h2>
        <span className="text-xs text-amber-500 font-medium">
          {isSaving ? "保存中…" : saved && content ? "保存済み ✓" : !saved ? "未保存" : ""}
        </span>
      </div>
      <p className="text-xs text-amber-700/60 mb-3">自分だけに見えるメモです</p>
      <textarea
        value={content}
        onChange={handleChange}
        onBlur={handleBlur}
        className="w-full min-h-[160px] rounded-xl border border-yellow-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-300 resize-y"
        placeholder="気づきやポイントをメモしておこう"
      />
      <p className="text-xs text-amber-600/50 mt-1.5">入力が止まると自動保存されます</p>
    </div>
  );
}
