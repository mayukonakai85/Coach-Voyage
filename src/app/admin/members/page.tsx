import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
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
      isActive: true, memberStatus: true, createdAt: true, invitedAt: true, joinedMonth: true,
    },
  });

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">会員管理</h1>
          <p className="text-gray-500 mt-1">{members.length}名の会員</p>
        </div>
        <Link
          href="/admin/members/import"
          className="flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          CSVで取り込み
        </Link>
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
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-3 hidden lg:table-cell">入会月</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-3">招待</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider pl-3 pr-5 py-3">ステータス</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <MemberRow key={member.id} member={{ ...member, invitedAt: member.invitedAt ?? null, joinedMonth: member.joinedMonth ?? null, memberStatus: member.memberStatus }} currentUserId={session?.user?.id ?? ""} />
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
