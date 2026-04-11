import { prisma } from "@/lib/db";

function parseRequest(raw: string | null) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as { type?: string; theme?: string; detail?: string };
  } catch {}
  return { theme: raw };
}

export default async function ContentRequestsPage() {
  const members = await prisma.user.findMany({
    where: {
      contentRequest: { not: null },
    },
    select: {
      id: true,
      name: true,
      email: true,
      contentRequest: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const requests = members
    .map(m => ({ ...m, parsed: parseRequest(m.contentRequest) }))
    .filter(m => m.parsed && (m.parsed.type || m.parsed.theme || m.parsed.detail));

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
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 shrink-0">
                    {m.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {m.parsed?.type && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        m.parsed.type === "セミナー"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {m.parsed.type}
                      </span>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(m.updatedAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {m.parsed?.theme && (
                    <div className="bg-gray-50 rounded-lg px-4 py-3">
                      <p className="text-xs font-semibold text-gray-400 mb-1">テーマ</p>
                      <p className="text-sm text-gray-700">{m.parsed.theme}</p>
                    </div>
                  )}
                  {m.parsed?.detail && (
                    <div className="bg-gray-50 rounded-lg px-4 py-3">
                      <p className="text-xs font-semibold text-gray-400 mb-1">知りたいこと</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{m.parsed.detail}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
