import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/Avatar";

export default async function MembersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const members = await prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
      role: true,
      title: true,
      createdAt: true,
      _count: { select: { views: true, comments: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-blue-600 font-semibold uppercase tracking-widest mb-1">Member Portal</p>
        <h1 className="text-2xl font-bold text-gray-900">メンバー一覧</h1>
        <p className="text-gray-500 text-sm mt-1">{members.length}名が参加中</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => {
          const isMe = member.id === session.user.id;
          const joinedDate = new Date(member.createdAt).toLocaleDateString("ja-JP", {
            year: "numeric", month: "short",
          });

          return (
            <div
              key={member.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
                isMe ? "border-blue-200 ring-1 ring-blue-200" : "border-gray-100"
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <Avatar name={member.name} avatarUrl={member.avatarUrl} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm truncate">{member.name}</p>
                    {isMe && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">あなた</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {member.title && (
                      <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-full">{member.title}</span>
                    )}
                    {member.role === "ADMIN" && (
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">管理者</span>
                    )}
                    <span className="text-xs text-gray-400">{joinedDate} 参加</span>
                  </div>
                </div>
              </div>

              {member.bio ? (
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-3">{member.bio}</p>
              ) : (
                <p className="text-sm text-gray-300 italic mb-3">自己紹介はまだありません</p>
              )}

              <div className="flex gap-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                <span>視聴 <strong className="text-gray-600">{member._count.views}</strong></span>
                <span>コメント <strong className="text-gray-600">{member._count.comments}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
