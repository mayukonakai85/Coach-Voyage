import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateBunnySignedEmbedUrl } from "@/lib/bunny";
import { getCategoryByName } from "@/lib/categories";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LearningNote } from "@/components/LearningNote";
import { VideoComments } from "@/components/VideoComments";
import { VideoLikeButton } from "@/components/VideoLikeButton";

export default async function VideoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  const [video, note, videoLike] = await Promise.all([
    prisma.video.findFirst({ where: { id: params.id, isPublished: true } }),
    session
      ? prisma.note.findUnique({
          where: { userId_videoId: { userId: session.user.id, videoId: params.id } },
        })
      : null,
    session
      ? prisma.like.findUnique({
          where: { userId_videoId: { userId: session.user.id, videoId: params.id } },
        })
      : null,
  ]);

  if (!video) notFound();

  const likeCount = await prisma.like.count({ where: { videoId: params.id } });
  const signedEmbedUrl = generateBunnySignedEmbedUrl(video.bunnyVideoId);
  const cat = getCategoryByName(video.category);

  const fmt = (d: Date | null) =>
    d ? d.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" }) : null;

  const recordedDate = fmt(video.recordedAt);
  const uploadedDate = fmt(video.publishedAt);

  return (
    <div className="max-w-4xl mx-auto">
      {/* パンくず */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/videos" className="hover:text-blue-600 transition-colors">
          Voyage Library
        </Link>
        {cat && (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href={`/videos/${cat.slug}`} className="hover:text-blue-600 transition-colors">
              {cat.name}
            </Link>
          </>
        )}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-600 truncate max-w-xs">{video.title}</span>
      </nav>

      {/* 動画プレイヤー */}
      <div className="card overflow-hidden mb-6">
        <div className="aspect-video bg-black">
          <VideoPlayer
            src={signedEmbedUrl}
            title={video.title}
            videoId={video.id}
          />
        </div>
      </div>

      {/* 動画情報 */}
      <div className="card px-5 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-base font-bold text-gray-900 flex-1 min-w-0">{video.title}</h1>
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {recordedDate && (
              <span className="text-xs text-gray-500">収録日：{recordedDate}</span>
            )}
            <span className="text-xs text-gray-400">アップ日：{uploadedDate}</span>
            {session && (
              <VideoLikeButton videoId={video.id} initialLiked={!!videoLike} initialCount={likeCount} />
            )}
          </div>
        </div>
        {video.description && (
          <p className="text-sm text-gray-500 mt-2 leading-relaxed whitespace-pre-wrap border-t border-gray-100 pt-2">
            {video.description}
          </p>
        )}
      </div>

      {/* ノート & コメント */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <LearningNote videoId={video.id} initialContent={note?.content ?? ""} />
        {session && (
          <VideoComments
            videoId={video.id}
            currentUserId={session.user.id}
            currentUserRole={session.user.role}
          />
        )}
      </div>
    </div>
  );
}
