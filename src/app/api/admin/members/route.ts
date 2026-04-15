import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

// 会員一覧
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const members = await prisma.user.findMany({
    where: { role: "MEMBER" },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(members);
}

// 会員追加
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "名前・メールアドレスは必須です" },
        { status: 400 }
      );
    }

    // メールアドレスの重複チェック
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 400 }
      );
    }

    // 仮パスワード（ログイン不可な状態）とリセットトークン
    const tempPassword = await bcrypt.hash(randomBytes(32).toString("hex"), 10);
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間

    const member = await prisma.user.create({
      data: {
        name,
        email,
        password: tempPassword,
        role: "MEMBER",
        isActive: true,
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
      },
    });

    revalidateTag("members");
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Member create error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
