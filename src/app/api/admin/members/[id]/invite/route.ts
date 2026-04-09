import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // 新しいトークンを発行
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: params.id },
    data: { passwordResetToken: token, passwordResetExpires: expires },
  });

  try {
    await sendWelcomeEmail({ to: user.email, name: user.name, token });
  } catch (err) {
    console.error("Invite email error:", err);
    return NextResponse.json({ error: "メール送信に失敗しました。設定を確認してください。" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
