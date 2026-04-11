import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AddMemberForm } from "./AddMemberForm";
import { InviteButton } from "./InviteButton";
import { MemberRow } from "./MemberRow";

export default async function AdminMembersPage() {
  const session = await getServerSession(authOptions);
  const members = await prisma.user.findMany({
    where: { role: { in: ["MEMBER", "ADMIN"] } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, name: true, email: true, role: true, title: true,
      isActive: true, createdAt: true, invitedAt: true,
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">会員管理</h1>
        <p className="text-gray-500 mt-1">{members.length}名の会員</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 会員追加フォーム */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">会員を追加</h2>
            <AddMemberForm />
          </div>
        </div>

        {/* 会員一覧 */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            {members.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <p className="font-medium">会員がまだいません</p>
                <p className="text-sm mt-1">左のフォームから追加してください</p>
              </div>
            ) : (
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-auto" />
                  <col className="w-28 hidden sm:table-column" />
                  <col className="w-24 hidden md:table-column" />
                  <col className="w-24 hidden lg:table-column" />
                  <col className="w-36" />
                  <col className="w-24" />
                </colgroup>
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pl-5 pr-3 py-3">名前</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-3 hidden sm:table-cell">役職</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-3 hidden md:table-cell">権限</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-3 hidden lg:table-cell">登録日</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-3">招待</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider pl-3 pr-5 py-3">ステータス</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <MemberRow key={member.id} member={{ ...member, invitedAt: member.invitedAt ?? null }} currentUserId={session?.user?.id ?? ""} />
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
