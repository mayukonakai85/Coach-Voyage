import Link from "next/link";

type Video = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  publishedAt: string | Date;
  recordedAt?: string | Date | null;
  sortOrder?: number;
  isViewed?: boolean;
};

export function VideoCard({ video }: { video: Video }) {
  const showNumber = video.sortOrder !== undefined && video.sortOrder < 999 && !video.recordedAt;
  const isViewed = video.isViewed ?? false;
  // 7日以内に公開された動画はNEW扱い
  const isNew = !isViewed && (Date.now() - new Date(video.publishedAt).getTime()) < 7 * 24 * 60 * 60 * 1000;

  const recordedDate = video.recordedAt
    ? new Date(video.recordedAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const uploadedDate = new Date(video.publishedAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/videos/watch/${video.id}`} className="group block">
      <div className="card overflow-hidden hover:shadow-md transition-shadow duration-200">
        {/* サムネイル */}
        <div className="aspect-video bg-gradient-to-br from-blue-800 to-blue-600 relative overflow-hidden">
          {video.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-blue-300 opacity-60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* 番号バッジ（番号ファイルのみ） */}
          {showNumber && (
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded">
              #{video.sortOrder}
            </div>
          )}

          {/* NEWバッジ */}
          {isNew && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
              NEW
            </div>
          )}

          {/* 視聴済みバッジ */}
          {isViewed && !isNew && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              視聴済み
            </div>
          )}

          {/* 再生ボタンオーバーレイ */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20">
            <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-700 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-5">
          <h3 className="font-semibold text-gray-900 text-base leading-snug mb-3 group-hover:text-blue-700 transition-colors line-clamp-2">
            {video.title}
          </h3>

          {/* 日付情報 */}
          <div className="space-y-1">
            {recordedDate && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>収録日：{recordedDate}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>アップ日：{uploadedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
