"use client";

import { useState } from "react";

export function VideoLikeButton({
  videoId,
  initialLiked,
  initialCount,
}: {
  videoId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  async function handleLike() {
    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId }),
    });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setCount((c) => data.liked ? c + 1 : c - 1);
    }
  }

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
        liked
          ? "bg-red-50 border-red-200 text-red-500"
          : "border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400"
      }`}
    >
      <span className="text-base">{liked ? "❤️" : "🤍"}</span>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
