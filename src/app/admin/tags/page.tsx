import { prisma } from "@/lib/db";
import { TagManager } from "./TagManager";

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { users: true } } },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">タグ管理</h1>
        <p className="text-gray-500 mt-1">興味関心タグの追加・編集・削除</p>
      </div>
      <TagManager initialTags={tags} />
    </div>
  );
}
