"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/home";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("メールアドレスまたはパスワードが正しくありません。");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="card p-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">ログイン</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="label">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="example@email.com"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="パスワードを入力"
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3 text-base"
        >
          {isLoading ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      <div className="mt-5 text-center">
        <Link href="/forgot-password" className="text-xs text-gray-400 hover:text-blue-600 transition-colors">
          パスワードをお忘れの方
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700 px-4">
      <div className="w-full max-w-md">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-withe.png"
            alt="Coach Voyage"
            className="h-14 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-white">Coach Voyage</h1>
          <p className="text-blue-200 mt-1 text-sm">メンバーページ</p>
        </div>

        <Suspense fallback={<div className="card p-8 text-center text-gray-400">読み込み中...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
