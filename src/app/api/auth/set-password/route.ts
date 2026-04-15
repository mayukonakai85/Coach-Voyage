import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: "パスワードは8文字以上にしてください" }, { status: 400 });
  }

  const now = new Date();

  // 招待トークンとパスワードリセットトークンの両方を確認（別フィールドで管理）
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { inviteToken: token, inviteTokenExpires: { gt: now } },
        { passwordResetToken: token, passwordResetExpires: { gt: now } },
      ],
    },
  });

  if (!user) {
    return NextResponse.json({ error: "リンクが無効か期限切れです" }, { status: 400 });
  }

  const isInviteToken = user.inviteToken === token;
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      // 使用済みトークンを消去
      ...(isInviteToken
        ? { inviteToken: null, inviteTokenExpires: null }
        : { passwordResetToken: null, passwordResetExpires: null }),
      // 招待リンクからのパスワード設定時のみ会員を有効化
      ...(isInviteToken && {
        isActive: true,
        memberStatus: user.memberStatus === "PENDING" ? "ACTIVE" : user.memberStatus,
      }),
    },
  });

  return NextResponse.json({ success: true });
}
