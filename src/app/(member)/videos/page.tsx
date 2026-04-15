import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCachedVideoCounts, getCachedTopVideos } from "@/lib/cache";
import { CATEGORIES } from "@/lib/categories";
import Link from "next/link";
import { VideoCard } from "@/components/VideoCard";
import { LibraryTabs } from "@/components/LibraryTabs";

export default async function VoyageLibraryPage() {
  const session = await getServerSession(authOptions);
  const cdnHost = process.env.BUNNY_CDN_HOSTNAME;

  const [counts, topVideos, viewedRecords] = await Promise.all([
    getCachedVideoCounts(),
    getCachedTopVideos(),
    session
      ? prisma.videoView.findMany({
          where: { userId: session.user.id },
          select: { videoId: true },
        })
      : [],
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c.category, c._count.id]));
  const viewedIds = new Set(viewedRecords.map((v) => v.videoId));

  const topVideosWithMeta = topVideos.map((v) => ({
    ...v,
    thumbnailUrl: v.thumbnailUrl || (cdnHost ? `https://${cdnHost}/${v.bunnyVideoId}/thumbnail.jpg` : null),
    isViewed: viewedIds.has(v.id),
  }));

  return (
    <div>
      {/* ページヘッダー */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-blue-600 font-semibold uppercase tracking-widest mb-1">
            Member page
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Voyage Library</h1>
          <p className="text-gray-500 mt-1">{session?.user?.name} さん、こんにちは！</p>
        </div>
        <form action="/videos/search" method="get" className="shrink-0">
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              name="q"
              placeholder="動画を検索..."
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-40 sm:w-52 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-gray-50"
            />
          </div>
        </form>
      </div>

      <LibraryTabs active="all" />

      {/* カテゴリグリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
        {CATEGORIES.map((cat) => {
          const count = countMap[cat.name] ?? 0;
          return (
            <Link key={cat.slug} href={`/videos/${cat.slug}`} className="group block">
              <div className="card p-7 hover:shadow-md transition-all duration-200 hover:border-blue-200 border border-transparent flex items-center gap-5">
                <div className="text-4xl shrink-0">{cat.icon}</div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                    {cat.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">{cat.description}</p>
                  <p className="text-sm font-medium text-blue-600 mt-2">{count}本</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 人気動画 TOP3 */}
      {topVideosWithMeta.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-lg font-bold text-gray-900">人気動画 TOP3</h2>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topVideosWithMeta.map((video, i) => (
              <div key={video.id} className="relative">
                <div className="absolute -top-3 -left-2 z-10 w-8 h-8 bg-yellow-400 text-white font-black text-sm rounded-full flex items-center justify-center shadow">
                  {i + 1}
                </div>
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
