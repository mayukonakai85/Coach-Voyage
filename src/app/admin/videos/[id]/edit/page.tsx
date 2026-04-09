import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { VideoForm } from "../../VideoForm";

export default async function EditVideoPage({
  params,
}: {
  params: { id: string };
}) {
  const video = await prisma.video.findUnique({
    where: { id: params.id },
  });

  if (!video) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">動画を編集</h1>
        <p className="text-gray-500 mt-1 truncate">{video.title}</p>
      </div>
      <VideoForm
        videoId={video.id}
        initialData={{
          title: video.title,
          description: video.description,
          bunnyVideoId: video.bunnyVideoId,
          thumbnailUrl: video.thumbnailUrl ?? "",
          category: video.category,
          sortOrder: video.sortOrder,
          publishedAt: video.publishedAt.toISOString(),
          isPublished: video.isPublished,
        }}
      />
    </div>
  );
}
