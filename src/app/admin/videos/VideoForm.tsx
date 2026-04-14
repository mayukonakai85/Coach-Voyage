"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";

type VideoFormData = {
  title: string;
  description: string;
  bunnyVideoId: string;
  thumbnailUrl: string;
  category: string;
  sortOrder: number;
  publishedAt: string;
  isPublished: boolean;
  schedulePublishAt: string;
  isSpecialSeminar: boolean;
  lecturers: string[];
};

export function VideoForm({
  initialData,
  videoId,
}: {
  initialData?: Partial<VideoFormData>;
  videoId?: string;
}) {
  const router = useRouter();
  const isEdit = !!videoId;

  const [form, setForm] = useState<VideoFormData>({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    bunnyVideoId: initialData?.bunnyVideoId ?? "",
    thumbnailUrl: initialData?.thumbnailUrl ?? "",
    category: initialData?.category ?? "uncategorized",
    sortOrder: initialData?.sortOrder ?? 0,
    publishedAt: initialData?.publishedAt
      ? new Date(initialData.publishedAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    isPublished: initialData?.isPublished ?? true,
    schedulePublishAt: initialData?.schedulePublishAt
      ? (() => {
          const d = new Date(initialData.schedulePublishAt as string);
          const pad = (n: number) => String(n).padStart(2, "0");
          return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}`;
        })()
      : "",
    isSpecialSeminar: initialData?.isSpecialSeminar ?? false,
    lecturers: initialData?.lecturers ?? [],
  });

  const [newLecturer, setNewLecturer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const url = isEdit ? `/api/admin/videos/${videoId}` : "/api/admin/videos";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "保存に失敗しました");
      }

      router.push("/admin/videos");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
      setIsLoading(false);
    }
  }

  return (
    <div className="card p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
            e.preventDefault();
          }
        }}
      >
        <div>
          <label className="label">タイトル *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input"
            placeholder="動画のタイトルを入力"
            required
          />
        </div>

        <div>
          <label className="label">説明</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input resize-none"
            rows={4}
            placeholder="動画の内容を説明してください"
          />
        </div>

        <div>
          <label className="label">Bunny.net 動画ID *</label>
          <input
            type="text"
            value={form.bunnyVideoId}
            onChange={(e) => setForm({ ...form, bunnyVideoId: e.target.value })}
            className="input font-mono"
            placeholder="例: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Bunny.net Stream → ライブラリ → 動画を選択 → 動画IDから確認できます
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">カテゴリ *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input"
              required
            >
              <option value="uncategorized">未分類</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">表示順</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              className="input"
              min={0}
              placeholder="0"
            />
            <p className="text-xs text-gray-400 mt-1">数字が小さいほど上に表示</p>
          </div>
        </div>

        <div>
          <label className="label">サムネイルURL（任意）</label>
          <input
            type="url"
            value={form.thumbnailUrl}
            onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
            className="input"
            placeholder="https://... （空白の場合はBunny.netのデフォルトサムネイルを使用）"
          />
        </div>

        <div>
          <label className="label">公開日 *</label>
          <input
            type="date"
            value={form.publishedAt}
            onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
            className="input"
            required
          />
        </div>

        <div>
          <label className="label">予約公開日時（任意）</label>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={form.schedulePublishAt ? form.schedulePublishAt.split("T")[0] : ""}
              onChange={(e) => {
                const hour = form.schedulePublishAt ? form.schedulePublishAt.split("T")[1] ?? "10" : "10";
                setForm({ ...form, schedulePublishAt: e.target.value ? `${e.target.value}T${hour}` : "" });
              }}
              className="input flex-1"
            />
            <select
              value={form.schedulePublishAt ? form.schedulePublishAt.split("T")[1] ?? "" : ""}
              onChange={(e) => {
                const date = form.schedulePublishAt ? form.schedulePublishAt.split("T")[0] : "";
                if (date) setForm({ ...form, schedulePublishAt: `${date}T${e.target.value}` });
              }}
              disabled={!form.schedulePublishAt}
              className="input w-28"
            >
              {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map(h => (
                <option key={h} value={h}>{h}:00</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            設定した日時になると自動で公開されます。空白の場合は下の公開チェックに従います。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isPublished"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
            公開する（チェックを外すと会員には表示されません）
          </label>
        </div>

        {/* Special seminar */}
        <div className="border border-gray-200 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isSpecialSeminar"
              checked={form.isSpecialSeminar}
              onChange={(e) => setForm({ ...form, isSpecialSeminar: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="isSpecialSeminar" className="text-sm font-medium text-gray-700">
              Special seminar として表示する
            </label>
          </div>

          {form.isSpecialSeminar && (
            <div>
              <label className="label">講師</label>
              <div className="space-y-2 mb-2">
                {form.lecturers.map((name, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex-1 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">{name}</span>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, lecturers: prev.lecturers.filter((_, j) => j !== i) }))}
                      className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
                    >×</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLecturer}
                  onChange={(e) => setNewLecturer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      const val = newLecturer.trim();
                      if (val) {
                        setForm((prev) => ({ ...prev, lecturers: [...prev.lecturers, val] }));
                        setNewLecturer("");
                      }
                    }
                  }}
                  className="input flex-1"
                  placeholder="講師名を入力してEnterまたは追加ボタン"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = newLecturer.trim();
                    if (val) {
                      setForm((prev) => ({ ...prev, lecturers: [...prev.lecturers, val] }));
                      setNewLecturer("");
                    }
                  }}
                  className="btn-secondary text-sm px-3"
                >追加</button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? "保存中..." : isEdit ? "更新する" : "追加する"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
