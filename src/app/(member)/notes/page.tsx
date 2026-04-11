import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NotesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    include: {
      video: { select: { id: true, title: true, category: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-blue-600 font-semibold uppercase tracking-widest mb-1">Member page</p>
        <h1 className="text-2xl font-bold text-gray-900">学習ノート</h1>
        <p className="text-gray-500 mt-1">動画ごとに書いたメモの一覧</p>
      </div>

      {notes.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">
          <p className="text-4xl mb-4">📝</p>
          <p className="font-medium">まだノートがありません</p>
          <p className="text-sm mt-1">動画を視聴してメモを書いてみましょう</p>
          <Link href="/videos" className="text-blue-600 text-sm mt-4 inline-block hover:underline">
            Voyage Library へ →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => {
            const updated = new Date(note.updatedAt).toLocaleDateString("ja-JP", {
              year: "numeric", month: "long", day: "numeric",
            });
            return (
              <Link key={note.id} href={`/videos/watch/${note.video.id}`} className="block group">
                <div className="card p-5 hover:shadow-md hover:border-blue-200 border border-transparent transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-blue-600 mb-1">{note.video.category}</p>
                      <p className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-blue-700 transition-colors truncate">
                        {note.video.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-3 whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 shrink-0 mt-1 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">最終更新：{updated}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
