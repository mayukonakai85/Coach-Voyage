"use client";

import { useState, useRef } from "react";
import Link from "next/link";

// Googleフォーム回答CSVのヘッダーをキーにマッピング
const COLUMN_MAP: Record<string, string> = {
  "お名前": "name",
  "お名前（ローマ字表記）": "nameRoman",
  "住所": "address",
  "生年月日": "birthDate",
  "メールアドレス": "email",
  "携帯電話番号": "phone",
  "会社名 or 屋号": "companyName",
  "会社名 or 屋号（カナ）": "companyNameKana",
  "ホームページ": "website",
  "紹介者": "referrer",
  "コーチング実績（時間）": "coachingHours",
  "保持しているコーチング資格": "coachingCertifications",
  "タイムスタンプ": "formSubmittedAt",
};

// コーチングスクール列は前方一致で対応（列名が長い）
function findKey(header: string): string | null {
  if (COLUMN_MAP[header]) return COLUMN_MAP[header];
  if (header.startsWith("コーチングスクール")) return "coachingSchool";
  return null;
}

// RFC 4180準拠のCSVパーサー
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 2; continue; }
      if (ch === '"') { inQuotes = false; i++; continue; }
      field += ch;
    } else {
      if (ch === '"') { inQuotes = true; i++; continue; }
      if (ch === ',') { row.push(field); field = ""; i++; continue; }
      if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
        row.push(field); field = "";
        if (row.some(v => v !== "")) rows.push(row);
        row = [];
        i += ch === '\r' ? 2 : 1;
        continue;
      }
      field += ch;
    }
    i++;
  }
  if (field || row.length > 0) { row.push(field); if (row.some(v => v !== "")) rows.push(row); }
  return rows;
}

type PreviewRow = Record<string, string>;
type ImportResult = { updated: number; created: number; skipped: number; errors: string[] };

export default function ImportPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [unmapped, setUnmapped] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setResult(null);
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length < 2) { setError("データが見つかりませんでした"); return; }

      const headers = rows[0];
      const missed: string[] = [];
      headers.forEach(h => { if (h && !findKey(h)) missed.push(h); });
      setUnmapped(missed.filter(h => !["個人情報", "キャンセル", "コミュニティ"].some(kw => h.includes(kw))));

      const parsed: PreviewRow[] = rows.slice(1).map(cols => {
        const obj: PreviewRow = {};
        headers.forEach((h, i) => {
          const key = findKey(h);
          if (key) obj[key] = cols[i] ?? "";
        });
        return obj;
      }).filter(r => r.email);

      setPreview(parsed);
    };
    reader.readAsText(file, "UTF-8");
  }

  async function handleImport() {
    if (!preview) return;
    setImporting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/import-forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: preview }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "エラーが発生しました"); return; }
      setResult(data);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/members" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">フォームデータ一括取り込み</h1>
          <p className="text-sm text-gray-400 mt-0.5">Googleフォームの回答CSVをアップロードしてインポートします</p>
        </div>
      </div>

      {/* 手順 */}
      <div className="bg-blue-50 rounded-xl p-5 text-sm text-blue-800 space-y-1.5">
        <p className="font-semibold mb-2">CSVのダウンロード方法</p>
        <p>① Googleフォームの「回答」タブ → スプレッドシートアイコンをクリック</p>
        <p>② スプレッドシートが開いたら「ファイル → ダウンロード → カンマ区切り (.csv)」</p>
        <p>③ ダウンロードしたCSVを下のファイル選択でアップロード</p>
      </div>

      {/* ファイル選択 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">CSVファイルを選択</label>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
        />
      </div>

      {/* エラー */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      {/* 認識できなかった列の警告 */}
      {unmapped.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          <p className="font-semibold mb-1">以下の列は取り込み対象外です（無視されます）</p>
          <p className="text-yellow-700">{unmapped.join("、")}</p>
        </div>
      )}

      {/* プレビュー */}
      {preview && preview.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-800">{preview.length}件のデータを検出</p>
            <span className="text-xs text-gray-400">メールアドレスで既存会員と照合します</span>
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-lg">
            {preview.slice(0, 20).map((row, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <span className="text-gray-400 w-5 shrink-0 text-right">{i + 1}</span>
                <span className="font-medium text-gray-800 truncate">{row.name || "（名前なし）"}</span>
                <span className="text-gray-400 truncate">{row.email}</span>
              </div>
            ))}
            {preview.length > 20 && (
              <div className="px-4 py-2.5 text-xs text-gray-400 text-center">…他 {preview.length - 20} 件</div>
            )}
          </div>

          <button
            onClick={handleImport}
            disabled={importing}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
          >
            {importing ? "取り込み中…" : `${preview.length}件をインポートする`}
          </button>
        </div>
      )}

      {preview && preview.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          メールアドレスのある行が見つかりませんでした。CSVの形式を確認してください。
        </div>
      )}

      {/* 結果 */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-3">
          <p className="font-bold text-green-800">インポート完了</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-600">{result.updated}</p>
              <p className="text-xs text-gray-500 mt-0.5">既存会員を更新</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-2xl font-bold text-green-600">{result.created}</p>
              <p className="text-xs text-gray-500 mt-0.5">新規仮登録</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-2xl font-bold text-gray-400">{result.skipped}</p>
              <p className="text-xs text-gray-500 mt-0.5">スキップ</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3 text-xs text-red-700 space-y-1">
              <p className="font-semibold">エラー：</p>
              {result.errors.map((e, i) => <p key={i}>{e}</p>)}
            </div>
          )}
          <Link
            href="/admin/members"
            className="block w-full text-center bg-white border border-green-300 text-green-700 font-semibold py-2 rounded-lg text-sm hover:bg-green-50 transition-colors"
          >
            会員一覧に戻る
          </Link>
        </div>
      )}
    </div>
  );
}
