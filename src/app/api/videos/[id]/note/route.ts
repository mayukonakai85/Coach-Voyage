import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// ノート取得
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const note = await prisma.note.findUnique({
    where: { userId_videoId: { userId: session.user.id, videoId: params.id } },
  });

  return NextResponse.json({ content: note?.content ?? "" });
}

// ノート保存（作成 or 更新）
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();

  if (!content || !content.trim()) {
    // 空なら削除
    await prisma.note.deleteMany({
      where: { userId: session.user.id, videoId: params.id },
    });
    return NextResponse.json({ success: true });
  }

  const note = await prisma.note.upsert({
    where: { userId_videoId: { userId: session.user.id, videoId: params.id } },
    update: { content },
    create: { userId: session.user.id, videoId: params.id, content },
  });

  return NextResponse.json(note);
}
