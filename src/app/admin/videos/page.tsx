import { prisma } from "@/lib/db";
import Link from "next/link";
import { DeleteVideoButton } from "./DeleteVideoButton";
import { CATEGORIES } from "@/lib/categories";
import { Pagination } from "@/components/Pagination";

const PAGE_SIZE = 50;

const ALL_CATEGORIES = [
  { name: "すべて", value: "" },
  ...CATEGORIES.map((c) => ({ name: c.name, value: c.name })),
  { name: "未分類", value: "uncategorized" },
];

export default async function AdminVideosPage({
  searchParams,
}: {
  searchParams: { cat?: string; page?: string };
}) {
  const cat = searchParams.cat ?? "";
  const page = Math.max(1, Number(searchParams.page ?? 1));

  const where = cat ? { category: cat } : {};

  const [total, videos] = await Promise.all([
    prisma.video.count({ where }),
    prisma.video.findMany({
      where,
      orderBy: [{ category: "asc" }, { publishedAt: "desc" }],
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function makeHref(p: number) {
    const params = new URLSearchParams();
    if (cat) params.set("cat", cat);
    params.set("page", String(p));
    return `/admin/videos?${params.toString()}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">動画管理</h1>
          <p className="text-gray-500 mt-1">{total}本の動画</p>
        </div>
        <Link href="/admin/videos/new" className="btn-primary">
          動画を追加
        </Link>
      </div>

      {/* カテゴリタブ */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {ALL_CATEGORIES.map((c) => {
          const isActive = c.value === cat;
          const href = c.value
            ? `/admin/videos?cat=${encodeURIComponent(c.value)}`
            : "/admin/videos";
          return (
            <Link
              key={c.value}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c.name}
            </Link>
          );
        })}
      </div>

      <div className="card overflow-hidden">
        {videos.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <p className="font-medium">動画がありません</p>
            <Link href="/admin/videos/new" className="btn-primary mt-4 inline-block">
              動画を追加する
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                  タイトル
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                  カテゴリ
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                  公開日
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
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
                  <td className="px-6 py-3">
                    <p className="font-medium text-gray-900 line-clamp-1 text-sm">{video.title}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5 truncate max-w-xs">
                      {video.bunnyVideoId}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {video.category === "uncategorized" ? "未分類" : video.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-500">
                    {new Date(video.publishedAt).toLocaleDateString("ja-JP")}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      video.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                    }`}>
                      {video.isPublished ? "公開中" : "非公開"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/videos/${video.id}/edit`} className="btn-secondary text-sm py-1.5 px-3">
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

      <Pagination currentPage={page} totalPages={totalPages} makeHref={makeHref} />
    </div>
  );
}
