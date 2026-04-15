import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendWelcomeEmail } from "@/lib/email";

export const maxDuration = 30;

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

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7日間有効

  // 招待トークンは専用フィールドに保存（passwordResetTokenとは独立させることで相互上書きを防ぐ）
  await prisma.user.update({
    where: { id: params.id },
    data: { inviteToken: token, inviteTokenExpires: expires, invitedAt: new Date() },
  });

  try {
    await sendWelcomeEmail({ to: user.email, name: user.name, token });
  } catch (err) {
    console.error("Invite email error:", err);
    // メール失敗時はトークンを無効化
    await prisma.user.update({
      where: { id: params.id },
      data: { inviteToken: null, inviteTokenExpires: null, invitedAt: null },
    });
    return NextResponse.json(
      { error: `メール送信に失敗しました: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
