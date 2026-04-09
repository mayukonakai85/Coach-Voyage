import { prisma } from "@/lib/db";
import Link from "next/link";
import { DeleteVideoButton } from "./DeleteVideoButton";

export default async function AdminVideosPage() {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">動画管理</h1>
          <p className="text-gray-500 mt-1">{videos.length}本の動画</p>
        </div>
        <Link href="/admin/videos/new" className="btn-primary">
          動画を追加
        </Link>
      </div>

      <div className="card overflow-hidden">
        {videos.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <p className="font-medium">動画がまだありません</p>
            <Link href="/admin/videos/new" className="btn-primary mt-4 inline-block">
              最初の動画を追加する
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                  タイトル
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                  公開日
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                  ステータス
                </th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {videos.map((video) => (
                <tr key={video.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {video.title}
                      </p>
                      <p className="text-sm text-gray-400 font-mono mt-0.5 truncate max-w-xs">
                        ID: {video.bunnyVideoId}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell text-sm text-gray-500">
                    {new Date(video.publishedAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        video.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {video.isPublished ? "公開中" : "非公開"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/videos/${video.id}/edit`}
                        className="btn-secondary text-sm py-1.5 px-3"
                      >
                        編集
                      </Link>
                      <DeleteVideoButton videoId={video.id} videoTitle={video.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
