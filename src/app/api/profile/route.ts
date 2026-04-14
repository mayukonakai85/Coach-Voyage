import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatarUrl: true,
      learningSince: true,
      role: true,
      createdAt: true,
      tags: { select: { tag: { select: { id: true, name: true } } } },
      _count: {
        select: { views: true, notes: true, comments: true },
      },
    },
  });

  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, bio, email, currentPassword, newPassword, learningSince, tagIds, contentRequest } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "名前は必須です" }, { status: 400 });
  }

  // コンテンツリクエストが変わったか確認するために現在値を取得
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { contentRequest: true, name: true },
  });

  const newContentRequest = contentRequest?.trim() || null;
  const contentRequestChanged = contentRequest !== undefined && newContentRequest !== currentUser?.contentRequest;

  const updateData: Record<string, unknown> = {
    name: name.trim(),
    bio: bio?.trim() || null,
    learningSince: learningSince?.trim() || null,
    contentRequest: newContentRequest,
  };

  // メール変更
  if (email && email !== session.user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ error: "このメールアドレスは既に使われています" }, { status: 400 });
    }
    updateData.email = email.trim();
  }

  // パスワード変更
  if (newPassword) {
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "パスワードは8文字以上にしてください" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const valid = user && await bcrypt.compare(currentPassword ?? "", user.password);
    if (!valid) {
      return NextResponse.json({ error: "現在のパスワードが正しくありません" }, { status: 400 });
    }
    updateData.password = await bcrypt.hash(newPassword, 12);
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: { id: true, name: true, bio: true, email: true, learningSince: true },
  });

  // タグを更新
  if (Array.isArray(tagIds)) {
    await prisma.userTag.deleteMany({ where: { userId: session.user.id } });
    if (tagIds.length > 0) {
      await prisma.userTag.createMany({
        data: tagIds.map((tagId: string) => ({ userId: session.user.id, tagId })),
      });
    }
  }

  // コンテンツリクエストが新規送信された場合、管理者全員に通知
  if (contentRequestChanged && newContentRequest) {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: "content_request",
          message: `${currentUser?.name ?? "メンバー"} さんからコンテンツリクエストが届きました`,
          link: "/admin/content-requests",
        })),
      });
    }
  }

  revalidateTag("members");
  return NextResponse.json(user);
}
