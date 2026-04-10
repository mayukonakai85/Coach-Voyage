import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LecturerManager } from "./LecturerManager";

export default async function LecturersPage({ params }: { params: { id: string } }) {
  const [seminar, members, lecturers] = await Promise.all([
    prisma.seminar.findUnique({ where: { id: params.id } }),
    prisma.user.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, avatarUrl: true, title: true },
    }),
    prisma.seminarLecturer.findMany({
      where: { seminarId: params.id },
      orderBy: { sortOrder: "asc" },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, title: true } },
      },
    }),
  ]);

  if (!seminar) notFound();

  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/seminars" className="text-sm text-blue-600 hover:underline">← イベント管理に戻る</Link>
      </div>
      <LecturerManager
        seminarId={seminar.id}
        seminarTitle={seminar.title}
        initialLecturers={lecturers}
        members={members}
      />
    </div>
  );
}
