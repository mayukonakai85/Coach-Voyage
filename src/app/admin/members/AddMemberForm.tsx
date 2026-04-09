"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddMemberForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "登録に失敗しました");
      }

      setSuccess(`${form.name} さんを会員登録しました。一覧の「招待メール」ボタンからメールを送れます。`);
      setForm({ name: "", email: "" });
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "登録に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {success}
        </div>
      )}

      <div>
        <label className="label">名前 *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input"
          placeholder="山田 太郎"
          required
        />
      </div>

      <div>
        <label className="label">メールアドレス *</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="input"
          placeholder="example@email.com"
          required
        />
      </div>

      <button type="submit" disabled={isLoading} className="btn-primary w-full">
        {isLoading ? "登録中..." : "会員を追加してメールを送る"}
      </button>
      <p className="text-xs text-gray-400 text-center">
        登録後、一覧から招待メールを送れます
      </p>
    </form>
  );
}
