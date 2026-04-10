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
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{video.title}</h1>
          {session && (
            <VideoLikeButton videoId={video.id} initialLiked={!!videoLike} initialCount={likeCount} />
          )}
        </div>

        {/* 日付情報 */}
        <div className="flex flex-wrap gap-4 mt-4 mb-4">
          {recordedDate && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>収録日：<span className="font-medium">{recordedDate}</span></span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>アップ日：{uploadedDate}</span>
          </div>
        </div>

        {video.description && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {video.description}
            </p>
          </div>
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
