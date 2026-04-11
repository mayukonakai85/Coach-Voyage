import { prisma } from "@/lib/db";

export default async function ContentRequestsPage() {
  const members = await prisma.user.findMany({
    where: {
      contentRequest: { not: null },
      role: "MEMBER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      contentRequest: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const requests = members.filter(m => m.contentRequest && m.contentRequest.trim() !== "");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">コンテンツリクエスト</h1>
        <p className="text-gray-500 mt-1 text-sm">メンバーから届いたセミナー・動画のリクエスト一覧</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-gray-400 text-sm">まだリクエストはありません</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">{requests.length}件のリクエスト</p>
          <div className="space-y-3">
            {requests.map((m) => (
              <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 shrink-0">
                    {m.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                  <p className="text-xs text-gray-400 ml-auto shrink-0">
                    {new Date(m.updatedAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg px-4 py-3 leading-relaxed">
                  {m.contentRequest}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
