import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";

export const maxDuration = 30;

// Vercel Cron Jobから毎時呼ばれる（vercel.jsonで設定）
// CRON_SECRET で不正アクセスを防ぐ
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const currentNext = await prisma.seminar.findFirst({ where: { isNext: true } });

  if (!currentNext || currentNext.scheduledAt > now) {
    // まだ時間が来ていない、または既にisNextがない
    return NextResponse.json({ updated: false });
  }

  // 時間が過ぎた → 次のセミナーに切り替える
  const nextUpcoming = await prisma.seminar.findFirst({
    where: { scheduledAt: { gte: now } },
    orderBy: { scheduledAt: "asc" },
  });

  await prisma.seminar.updateMany({ data: { isNext: false } });
  if (nextUpcoming) {
    await prisma.seminar.update({ where: { id: nextUpcoming.id }, data: { isNext: true } });
  }

  revalidateTag("seminars");

  return NextResponse.json({
    updated: true,
    previous: currentNext.title,
    next: nextUpcoming?.title ?? null,
  });
}
