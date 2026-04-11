"use client";

import { useState } from "react";

export function WatchLaterButton({
  videoId,
  initialAdded,
}: {
  videoId: string;
  initialAdded: boolean;
}) {
  const [added, setAdded] = useState(initialAdded);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/watch-later", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdded(data.added);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={added ? "後で見るから削除" : "後で見る"}
      className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
        added
          ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
          : "bg-gray-100 text-gray-500 hover:bg-purple-50 hover:text-purple-600"
      }`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d={added
            ? "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            : "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"}
        />
      </svg>
      {added ? "後で見る ✓" : "後で見る"}
    </button>
  );
}
