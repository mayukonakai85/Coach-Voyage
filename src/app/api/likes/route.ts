import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// いいねトグル（POST: videoId or commentId を body で受け取る）
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { videoId, commentId } = await req.json();

  if (videoId) {
    const existing = await prisma.like.findUnique({
      where: { userId_videoId: { userId: session.user.id, videoId } },
    });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.like.create({ data: { userId: session.user.id, videoId } });
      return NextResponse.json({ liked: true });
    }
  }

  if (commentId) {
    const existing = await prisma.like.findUnique({
      where: { userId_commentId: { userId: session.user.id, commentId } },
    });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.like.create({ data: { userId: session.user.id, commentId } });
      return NextResponse.json({ liked: true });
    }
  }

  return NextResponse.json({ error: "videoId or commentId required" }, { status: 400 });
}
