"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ToggleMemberButton({
  memberId,
  memberName,
  isActive,
}: {
  memberId: string;
  memberName: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggle() {
    const action = isActive ? "無効化" : "有効化";
    if (!confirm(`${memberName} さんのアカウントを${action}しますか？`)) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!res.ok) throw new Error("更新に失敗しました");

      router.refresh();
    } catch {
      alert("更新に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`text-sm py-1.5 px-3 rounded-lg font-medium transition-colors ${
        isActive
          ? "bg-red-50 hover:bg-red-100 text-red-700"
          : "bg-green-50 hover:bg-green-100 text-green-700"
      } disabled:opacity-50`}
    >
      {isLoading ? "..." : isActive ? "無効化" : "有効化"}
    </button>
  );
}
