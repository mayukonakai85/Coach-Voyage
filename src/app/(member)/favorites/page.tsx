import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { VideoCard } from "@/components/VideoCard";

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      video: {
        select: {
          id: true, title: true, description: true, thumbnailUrl: true,
          publishedAt: true, recordedAt: true, sortOrder: true,
        },
      },
    },
  });

  // 視聴済みチェック
  const viewedIds = new Set(
    (await prisma.videoView.findMany({
      where: { userId: session.user.id },
      select: { videoId: true },
    })).map(v => v.videoId)
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-blue-600 font-semibold uppercase tracking-widest mb-1">Member Portal</p>
        <h1 className="text-2xl font-bold text-gray-900">保存した動画</h1>
        <p className="text-sm text-gray-500 mt-1">{favorites.length}本の動画を保存中</p>
      </div>

      {favorites.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <p className="font-medium">保存した動画はありません</p>
          <p className="text-sm mt-1">動画ページの「保存」ボタンで追加できます</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(({ video }) => (
            <VideoCard
              key={video.id}
              video={{
                ...video,
                description: video.description ?? "",
                publishedAt: video.publishedAt,
                recordedAt: video.recordedAt,
                isViewed: viewedIds.has(video.id),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
