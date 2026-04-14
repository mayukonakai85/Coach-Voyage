"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "エラーが発生しました。再度お試しください。");
      return;
    }
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Coach Voyage</h1>
          <p className="text-blue-200 mt-1 text-sm">パスワードをお忘れの方</p>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-bold text-gray-900 mb-2">メールを送信しました</p>
              <p className="text-sm text-gray-500 mb-6">
                登録されたメールアドレスにパスワードリセットのリンクを送りました。メールをご確認ください。
              </p>
              <Link href="/login" className="text-sm text-blue-600 hover:underline">
                ← ログイン画面に戻る
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-gray-800 mb-2">パスワードをリセット</h2>
              <p className="text-sm text-gray-500 mb-6">登録済みのメールアドレスを入力してください。リセット用のリンクを送信します。</p>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">メールアドレス</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="example@email.com"
                    required
                    autoFocus
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? "送信中…" : "リセットメールを送る"}
                </button>
              </form>
              <div className="mt-5 text-center">
                <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">
                  ← ログイン画面に戻る
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
