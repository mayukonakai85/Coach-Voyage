import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "メールアドレスを入力してください" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });

  // ユーザーが存在しない場合、または退会済みの場合は送らない（セキュリティ）
  // PENDING（未設定）ユーザーはリセット可能にする
  if (!user || user.memberStatus === "INACTIVE") {
    return NextResponse.json({ success: true });
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: token, passwordResetExpires: expires },
  });

  try {
    await sendPasswordResetEmail({ to: user.email, name: user.name, token });
  } catch (err) {
    console.error("Password reset email error:", err);
    // メール失敗時はトークンを無効化し、クライアントにエラーを返す
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: null, passwordResetExpires: null },
    });
    return NextResponse.json({ error: "メール送信に失敗しました。しばらく経ってから再度お試しください。" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
