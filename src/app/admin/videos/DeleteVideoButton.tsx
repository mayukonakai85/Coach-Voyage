"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteVideoButton({
  videoId,
  videoTitle,
}: {
  videoId: string;
  videoTitle: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`「${videoTitle}」を削除しますか？この操作は取り消せません。`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/videos/${videoId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("削除に失敗しました");

      router.refresh();
    } catch (e) {
      alert("削除に失敗しました。もう一度お試しください。");
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="btn-danger text-sm py-1.5 px-3"
    >
      {isDeleting ? "削除中..." : "削除"}
    </button>
  );
}
