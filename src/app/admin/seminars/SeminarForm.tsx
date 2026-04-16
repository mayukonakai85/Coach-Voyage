"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initialData?: {
    id: string;
    title: string;
    description?: string | null;
    scheduledAt: Date;
    endsAt?: Date | null;
    zoomUrl: string | null;
    location?: string | null;
    isOnline: boolean;
    isNext: boolean;
  };
  onCancel?: () => void;
};

function toLocalParts(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    hour: pad(d.getHours()),
    minute: d.getMinutes() < 30 ? "00" : "30",
  };
}

export function SeminarForm({ initialData, onCancel }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;

  const init = initialData ? toLocalParts(new Date(initialData.scheduledAt)) : { date: "", hour: "10", minute: "00" };
  const initEnd = initialData?.endsAt ? toLocalParts(new Date(initialData.endsAt)) : { hour: "12", minute: "00" };

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    date: init.date,
    hour: init.hour,
    minute: init.minute,
    endHour: initEnd.hour,
    endMinute: initEnd.minute,
    zoomUrl: initialData?.zoomUrl ?? "",
    location: initialData?.location ?? "",
    isOnline: initialData?.isOnline ?? true,
    isNext: initialData?.isNext ?? false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const scheduledAt = `${form.date}T${form.hour}:${form.minute}:00+09:00`;
    const endsAt = `${form.date}T${form.endHour}:${form.endMinute}:00+09:00`;

    try {
      const url = isEdit ? `/api/admin/seminars/${initialData.id}` : "/api/admin/seminars";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, scheduledAt, endsAt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (!isEdit) {
        setSuccess("イベントを追加しました");
        setForm({ title: "", description: "", date: "", hour: "10", minute: "00", endHour: "12", endMinute: "00", zoomUrl: "", location: "", isOnline: true, isNext: false });
      }
      router.refresh();
      onCancel?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}

      <div>
        <label className="label">タイトル *</label>
        <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="input" placeholder="〇月イベント：テーマ名" required />
      </div>

      <div>
        <label className="label">説明</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="input resize-none" rows={3} placeholder="イベントの内容や対象者など" />
      </div>

      {/* オンライン/オフライン切り替え */}
      <div>
        <label className="label">開催形式 *</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setForm({ ...form, isOnline: true })}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
              form.isOnline ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-300"
            }`}
          >
            🌐 オンライン
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, isOnline: false })}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
              !form.isOnline ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-600 hover:border-green-300"
            }`}
          >
            📍 オフライン
          </button>
        </div>
      </div>

      <div>
        <label className="label">日付 *</label>
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="input" required />
      </div>

      <div>
        <label className="label">開始時刻 *</label>
        <div className="flex items-center gap-2">
          <select value={form.hour} onChange={(e) => setForm({ ...form, hour: e.target.value })} className="input w-24">
            {hours.map((h) => <option key={h} value={h}>{h}時</option>)}
          </select>
          <select value={form.minute} onChange={(e) => setForm({ ...form, minute: e.target.value })} className="input w-24">
            <option value="00">00分</option>
            <option value="30">30分</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">終了時刻 *</label>
        <p className="text-xs text-gray-400 mb-1.5">終了時刻を過ぎるとZoomリンクが非表示になります</p>
        <div className="flex items-center gap-2">
          <select value={form.endHour} onChange={(e) => setForm({ ...form, endHour: e.target.value })} className="input w-24">
            {hours.map((h) => <option key={h} value={h}>{h}時</option>)}
          </select>
          <select value={form.endMinute} onChange={(e) => setForm({ ...form, endMinute: e.target.value })} className="input w-24">
            <option value="00">00分</option>
            <option value="30">30分</option>
          </select>
        </div>
      </div>

      {form.isOnline ? (
        <div>
          <label className="label">Zoom URL</label>
          <input type="url" value={form.zoomUrl} onChange={(e) => setForm({ ...form, zoomUrl: e.target.value })}
            className="input" placeholder="https://zoom.us/j/..." />
        </div>
      ) : (
        <div>
          <label className="label">会場・場所</label>
          <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input" placeholder="例：東京都渋谷区〇〇ビル3F" />
        </div>
      )}

      <div className="flex items-center gap-3">
        <input type="checkbox" id="isNext" checked={form.isNext}
          onChange={(e) => setForm({ ...form, isNext: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        <label htmlFor="isNext" className="text-sm font-medium text-gray-700">
          次回イベントとしてトップに表示する
        </label>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={isLoading} className="btn-primary flex-1">
          {isLoading ? "保存中..." : isEdit ? "更新する" : "追加する"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">キャンセル</button>
        )}
      </div>
    </form>
  );
}
