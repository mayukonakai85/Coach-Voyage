"use client";

import { useState } from "react";

export function InviteButton({
  memberId,
  memberName,
  memberEmail,
  invitedAt,
}: {
  memberId: string;
  memberName: string;
  memberEmail: string;
  invitedAt: Date | null;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [lastInvitedAt, setLastInvitedAt] = useState<Date | null>(invitedAt);

  async function handleInvite() {
    const label = lastInvitedAt ? "再送" : "送信";
    if (!confirm(`${memberName}（${memberEmail}）に招待メールを${label}しますか？`)) return;
    setStatus("sending");
    setErrorMsg("");

    const res = await fetch(`/api/admin/members/${memberId}/invite`, { method: "POST" });
    if (res.ok) {
      setStatus("done");
      setLastInvitedAt(new Date());
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      const data = await res.json();
      setErrorMsg(data.error ?? "送信失敗");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  }

  const sentLabel = lastInvitedAt
    ? `送付済み ${new Date(lastInvitedAt).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })}`
    : null;

  return (
    <div className="flex flex-col items-end gap-0.5">
      <button
        onClick={handleInvite}
        disabled={status === "sending"}
        className={`text-xs py-1.5 px-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
          lastInvitedAt
            ? "bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-700"
            : "bg-blue-50 hover:bg-blue-100 text-blue-700"
        }`}
      >
        {status === "sending" ? "送信中…" :
         status === "done" ? "送信完了 ✓" :
         status === "error" ? "失敗 (再試行)" :
         lastInvitedAt ? "招待メールを再送" : "招待メール"}
      </button>
      {sentLabel && status === "idle" && (
        <p className="text-xs text-gray-400">{sentLabel}</p>
      )}
      {status === "error" && errorMsg && (
        <p className="text-xs text-red-500 max-w-[180px] text-right">{errorMsg}</p>
      )}
    </div>
  );
}
