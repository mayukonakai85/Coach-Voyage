"use client";

import { useState } from "react";

export function InviteButton({
  memberId,
  memberName,
  memberEmail,
}: {
  memberId: string;
  memberName: string;
  memberEmail: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleInvite() {
    if (!confirm(`${memberName}（${memberEmail}）に招待メールを送りますか？`)) return;
    setStatus("sending");
    setErrorMsg("");

    const res = await fetch(`/api/admin/members/${memberId}/invite`, { method: "POST" });
    if (res.ok) {
      setStatus("done");
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      const data = await res.json();
      setErrorMsg(data.error ?? "送信失敗");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }

  return (
    <div className="inline-block">
      <button
        onClick={handleInvite}
        disabled={status === "sending"}
        className="text-sm py-1.5 px-3 rounded-lg font-medium transition-colors bg-blue-50 hover:bg-blue-100 text-blue-700 disabled:opacity-50"
      >
        {status === "sending" ? "送信中…" : status === "done" ? "送信済み ✓" : status === "error" ? "失敗" : "招待メール"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-500 mt-1">{errorMsg}</p>
      )}
    </div>
  );
}
