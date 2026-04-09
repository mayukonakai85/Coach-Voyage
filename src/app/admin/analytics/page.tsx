import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function AnalyticsPage() {
  const [videos, members, totalViews] = await Promise.all([
    prisma.video.findMany({
      where: { isPublished: true },
      include: {
        views: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { viewedAt: "desc" },
        },
      },
      orderBy: { views: { _count: "desc" } },
    }),
    prisma.user.findMany({
      where: { isActive: true, role: "MEMBER" },
      include: {
        views: {
          include: { video: { select: { id: true, title: true, category: true } } },
          orderBy: { viewedAt: "desc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.videoView.count(),
  ]);

  const totalVideos = videos.length;
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.views.length > 0).length;
  const avgViewsPerMember = totalMembers > 0 ? (totalViews / totalMembers).toFixed(1) : "0";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">視聴データ</h1>
        <p className="text-gray-500 mt-1 text-sm">会員の視聴状況を確認できます</p>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "総視聴数", value: totalViews, unit: "回" },
          { label: "アクティブ会員", value: `${activeMembers}/${totalMembers}`, unit: "名" },
          { label: "平均視聴数", value: avgViewsPerMember, unit: "本/人" },
          { label: "公開動画", value: totalVideos, unit: "本" },
        ].map(({ label, value, unit }) => (
          <div key={label} className="card p-5 text-center">
            <p className="text-3xl font-black text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{unit}</p>
            <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* 動画別 */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-blue-500 inline-flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </span>
            動画別 視聴状況
          </h2>
          <div className="space-y-3">
            {videos.map((video) => {
              const pct = totalMembers > 0 ? Math.round((video.views.length / totalMembers) * 100) : 0;
              return (
                <div key={video.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{video.title}</p>
                      <p className="text-xs text-gray-400">{video.category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-gray-900">{video.views.length}</p>
                      <p className="text-xs text-gray-400">視聴</p>
                    </div>
                  </div>
                  {/* 進捗バー */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 w-8 text-right">{pct}%</span>
                  </div>
                  {/* 視聴者アバター */}
                  {video.views.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {video.views.slice(0, 8).map((v) => (
                        <span
                          key={v.userId}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                        >
                          {v.user.name}
                        </span>
                      ))}
                      {video.views.length > 8 && (
                        <span className="text-xs text-gray-400 px-1">+{video.views.length - 8}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 会員別 */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-green-500 inline-flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            会員別 視聴状況
          </h2>
          <div className="space-y-3">
            {members.map((member) => {
              const pct = totalVideos > 0 ? Math.round((member.views.length / totalVideos) * 100) : 0;
              return (
                <div key={member.id} className="card p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 truncate">{member.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-gray-900">{member.views.length}</p>
                      <p className="text-xs text-gray-400">/ {totalVideos}本</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 w-8 text-right">{pct}%</span>
                  </div>
                  {/* 最近見た動画 */}
                  {member.views.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {member.views.slice(0, 3).map((v) => (
                        <Link
                          key={v.videoId}
                          href={`/videos/watch/${v.videoId}`}
                          className="text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 px-2 py-0.5 rounded-full transition-colors truncate max-w-[160px]"
                        >
                          {v.video.title}
                        </Link>
                      ))}
                      {member.views.length > 3 && (
                        <span className="text-xs text-gray-400 px-1">+{member.views.length - 3}</span>
                      )}
                    </div>
                  )}
                  {member.views.length === 0 && (
                    <p className="text-xs text-gray-300 mt-1">まだ視聴なし</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
