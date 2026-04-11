import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

// イベントポップアップ設定取得
export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const settings = await prisma.eventPopupSettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json(settings ?? { isEnabled: false, title: "", body: "", buttonText: "詳細を見る", buttonUrl: null });
}

// イベントポップアップ設定更新 / メンバーへのポップアップ送信
export async function PUT(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  // イベントポップアップ設定の更新
  if (body.type === "event") {
    const { isEnabled, title, body: bodyText, buttonText, buttonUrl } = body;
    const settings = await prisma.eventPopupSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", isEnabled, title, body: bodyText, buttonText, buttonUrl: buttonUrl || null },
      update: { isEnabled, title, body: bodyText, buttonText, buttonUrl: buttonUrl || null },
    });
    return NextResponse.json(settings);
  }

  // 特定メンバーへのプロフィールポップアップ送信
  if (body.type === "profile" && Array.isArray(body.memberIds)) {
    await prisma.user.updateMany({
      where: { id: { in: body.memberIds } },
      data: { showProfilePopup: true },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
