import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { memberVideoFilter } from "@/lib/videoFilter";
import { VideoCard } from "@/components/VideoCard";
import { Pagination } from "@/components/Pagination";
import Link from "next/link";

const PAGE_SIZE = 30;

export default async function VideoSearchPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const session = await getServerSession(authOptions);
  const cdnHost = process.env.BUNNY_CDN_HOSTNAME;

  if (!q) {
    return (
      <div>
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/videos" className="hover:text-blue-600">Voyage Library</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">検索</span>
        </nav>
        <p className="text-gray-400 text-center py-16">検索キーワードを入力してください</p>
      </div>
    );
  }

  const where = {
    AND: [
      memberVideoFilter(),
      {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
      },
    ],
  };

  const [total, videos, viewedRecords] = await Promise.all([
    prisma.video.count({ where }),
    prisma.video.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      include: { lecturers: { orderBy: { sortOrder: "asc" } } },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    session
      ? prisma.videoView.findMany({ where: { userId: session.user.id }, select: { videoId: true } })
      : [],
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const viewedIds = new Set(viewedRecords.map((v) => v.videoId));

  const videosWithMeta = videos.map((v) => ({
    ...v,
    thumbnailUrl: v.thumbnailUrl || (cdnHost ? `https://${cdnHost}/${v.bunnyVideoId}/thumbnail.jpg` : null),
    isViewed: viewedIds.has(v.id),
  }));

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/videos" className="hover:text-blue-600 transition-colors">Voyage Library</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">「{q}」の検索結果</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">「{q}」の検索結果</h1>
        <p className="text-sm text-gray-500 mt-1">{total}件ヒット</p>
      </div>

      {videos.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">
          <p className="font-medium">「{q}」に一致する動画が見つかりませんでした</p>
          <Link href="/videos" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
            ← Voyage Library に戻る
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videosWithMeta.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            makeHref={(p) => `/videos/search?q=${encodeURIComponent(q)}&page=${p}`}
          />
        </>
      )}
    </div>
  );
}
