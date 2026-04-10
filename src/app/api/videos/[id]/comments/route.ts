import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// コメント一覧取得（返信・いいね込み）
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comments = await prisma.comment.findMany({
    where: { videoId: params.id, parentId: null }, // トップレベルのみ
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      likes: { select: { userId: true } },
      replies: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          likes: { select: { userId: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}

// コメント投稿
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, parentId } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const video = await prisma.video.findUnique({ where: { id: params.id }, select: { title: true } });

  const comment = await prisma.comment.create({
    data: {
      userId: session.user.id,
      videoId: params.id,
      content: content.trim(),
      parentId: parentId ?? null,
    },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      likes: { select: { userId: true } },
      replies: { include: { user: { select: { id: true, name: true, avatarUrl: true } }, likes: { select: { userId: true } } } },
    },
  });

  // 通知を作成
  const link = `/videos/watch/${params.id}`;

  if (parentId) {
    // 返信 → 元コメント投稿者に通知
    const parent = await prisma.comment.findUnique({ where: { id: parentId }, select: { userId: true } });
    if (parent && parent.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: parent.userId,
          type: "reply",
          message: `${session.user.name} さんがあなたのコメントに返信しました`,
          link,
        },
      });
    }
  } else {
    // 新規コメント → 管理者全員に通知
    const admins = await prisma.user.findMany({ where: { role: "ADMIN", id: { not: session.user.id } }, select: { id: true } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          type: "comment",
          message: `${session.user.name} さんが「${video?.title ?? "動画"}」にコメントしました`,
          link,
        })),
      });
    }
  }

  return NextResponse.json(comment, { status: 201 });
}
