import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { VideoCard } from "@/components/VideoCard";
import { LibraryTabs } from "@/components/LibraryTabs";

export default async function WatchLaterPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const list = await prisma.watchLater.findMany({
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

  const viewedIds = new Set(
    (await prisma.videoView.findMany({
      where: { userId: session.user.id },
      select: { videoId: true },
    })).map(v => v.videoId)
  );

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="text-sm text-blue-600 font-semibold uppercase tracking-widest mb-1">Member page</p>
        <h1 className="text-3xl font-bold text-gray-900">Voyage Library</h1>
      </div>
      <LibraryTabs active="watch-later" />
      <p className="text-sm text-gray-500 mb-6">{list.length}本の動画</p>

      {list.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium">リストはまだありません</p>
          <p className="text-sm mt-1">動画ページの「後で見る」ボタンで追加できます</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map(({ video }) => (
            <VideoCard
              key={video.id}
              video={{
                ...video,
                description: video.description ?? "",
                isViewed: viewedIds.has(video.id),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
