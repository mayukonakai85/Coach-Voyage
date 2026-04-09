"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Log = string;

export function ImportButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    updated: number;
    deleted: number;
    logs: Log[];
  } | null>(null);
  const [error, setError] = useState("");

  async function handleImport() {
    setIsLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/admin/import-bunny", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setResult(data);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "インポートに失敗しました");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-semibold text-gray-900">Bunny.net から動画をインポート</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Bunny.net のコレクション情報を読み込み、動画・カテゴリを自動で同期します
          </p>
        </div>
        <button
          onClick={handleImport}
          disabled={isLoading}
          className="btn-primary shrink-0 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              同期中...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              今すぐ同期
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center">
              <p className="text-2xl font-bold text-green-700">{result.imported}</p>
              <p className="text-xs text-green-600">新規登録</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-center">
              <p className="text-2xl font-bold text-blue-700">{result.updated}</p>
              <p className="text-xs text-blue-600">更新</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center">
              <p className="text-2xl font-bold text-red-600">{result.deleted}</p>
              <p className="text-xs text-red-500">削除</p>
            </div>
          </div>

          {/* ログ */}
          <details className="group">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
              詳細ログを見る ({result.logs.length}件)
            </summary>
            <div className="mt-2 bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
              {result.logs.map((log, i) => (
                <p key={i} className="text-xs text-gray-600 font-mono leading-5">
                  {log}
                </p>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
