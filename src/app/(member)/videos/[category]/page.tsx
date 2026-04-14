import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCategoryBySlug } from "@/lib/categories";
import { memberVideoFilter } from "@/lib/videoFilter";
import { VideoCard } from "@/components/VideoCard";
import { Pagination } from "@/components/Pagination";

const PAGE_SIZE = 30;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: { page?: string };
}) {
  const cat = getCategoryBySlug(params.category);
  if (!cat) notFound();

  const page = Math.max(1, Number(searchParams.page ?? 1));
  const session = await getServerSession(authOptions);
  const cdnHost = process.env.BUNNY_CDN_HOSTNAME;

  const where = memberVideoFilter({ category: cat.name });

  const [total, videos] = await Promise.all([
    prisma.video.count({ where }),
    prisma.video.findMany({
      where,
      orderBy: { sortOrder: "desc" },
      include: { lecturers: { orderBy: { sortOrder: "asc" } } },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // 現在ページの動画IDのみに絞って視聴履歴を取得（全件取得を避ける）
  const videoIds = videos.map((v) => v.id);
  const viewedRecords = session && videoIds.length > 0
    ? await prisma.videoView.findMany({
        where: { userId: session.user.id, videoId: { in: videoIds } },
        select: { videoId: true },
      })
    : [];
  const viewedIds = new Set(viewedRecords.map((v) => v.videoId));

  const videosWithMeta = videos.map((v) => ({
    ...v,
    thumbnailUrl:
      v.thumbnailUrl ||
      (cdnHost ? `https://${cdnHost}/${v.bunnyVideoId}/thumbnail.jpg` : null),
    isViewed: viewedIds.has(v.id),
  }));

  return (
    <div>
      {/* パンくず */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/videos" className="hover:text-blue-600 transition-colors">
          Voyage Library
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-700 font-medium">{cat.name}</span>
      </nav>

      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">{cat.icon}</span>
          <h1 className="text-2xl font-bold text-gray-900">{cat.name}</h1>
        </div>
        <p className="text-gray-500 text-sm">{cat.description}</p>
        <p className="text-sm text-blue-600 font-medium mt-1">{total}本</p>
      </div>

      {/* 動画グリッド */}
      {videos.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">
          <p className="font-medium">このカテゴリにはまだ動画がありません</p>
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
            makeHref={(p) => `/videos/${params.category}?page=${p}`}
          />
        </>
      )}
    </div>
  );
}
