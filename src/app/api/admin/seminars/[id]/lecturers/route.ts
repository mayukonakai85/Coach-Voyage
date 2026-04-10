import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

// 講師一覧取得
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const lecturers = await prisma.seminarLecturer.findMany({
    where: { seminarId: params.id },
    orderBy: { sortOrder: "asc" },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, title: true } },
    },
  });

  return NextResponse.json(lecturers);
}

// 講師を追加
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { userId, name, photoUrl, bio } = body;

    if (!name) return NextResponse.json({ error: "名前は必須です" }, { status: 400 });

    const count = await prisma.seminarLecturer.count({ where: { seminarId: params.id } });

    const lecturer = await prisma.seminarLecturer.create({
      data: {
        seminarId: params.id,
        userId: userId || null,
        name,
        photoUrl: photoUrl || null,
        bio: bio || null,
        sortOrder: count,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, title: true } },
      },
    });

    return NextResponse.json(lecturer, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
