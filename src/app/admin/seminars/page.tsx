import { prisma } from "@/lib/db";
import { SeminarForm } from "./SeminarForm";
import { SeminarRow } from "./SeminarRow";

export default async function AdminSeminarsPage() {
  const seminars = await prisma.seminar.findMany({
    orderBy: { scheduledAt: "asc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">イベント管理</h1>
        <p className="text-gray-500 mt-1">オンライン・オフラインイベントの追加・編集・削除ができます</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 追加フォーム */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">イベントを追加</h2>
            <SeminarForm />
          </div>
        </div>

        {/* 一覧 */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            {seminars.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <p className="font-medium">イベントがまだありません</p>
                <p className="text-sm mt-1">左のフォームから追加してください</p>
              </div>
            ) : (
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-auto" />
                  <col className="w-52 hidden sm:table-column" />
                  <col className="w-40" />
                </colgroup>
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">タイトル・日時</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Zoom URL / 場所</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {seminars.map((seminar) => (
                    <SeminarRow key={seminar.id} seminar={seminar} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
