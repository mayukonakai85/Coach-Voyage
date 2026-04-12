import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// コメント編集（自分のコメントのみ）
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "内容が空です" }, { status: 400 });

  const comment = await prisma.comment.findUnique({ where: { id: params.commentId } });
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (comment.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await prisma.comment.update({
    where: { id: params.commentId },
    data: { content: content.trim() },
  });
  return NextResponse.json(updated);
}

// コメント削除（自分のコメントのみ）
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comment = await prisma.comment.findUnique({
    where: { id: params.commentId },
  });

  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // 自分のコメントか管理者のみ削除可
  const isAdmin = session.user.role === "ADMIN";
  if (comment.userId !== session.user.id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id: params.commentId } });
  return NextResponse.json({ success: true });
}
