import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
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

  const updateData: Record<string, unknown> = {
    name: name.trim(),
    bio: bio?.trim() || null,
    learningSince: learningSince?.trim() || null,
    contentRequest: contentRequest?.trim() || null,
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

  return NextResponse.json(user);
}
