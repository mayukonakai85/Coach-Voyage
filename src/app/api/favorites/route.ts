import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// お気に入り一覧
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      video: {
        select: {
          id: true, title: true, description: true, thumbnailUrl: true,
          publishedAt: true, recordedAt: true, sortOrder: true, category: true,
        },
      },
    },
  });

  return NextResponse.json(favorites);
}

// お気に入りトグル
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { videoId } = await req.json();
  if (!videoId) return NextResponse.json({ error: "videoId required" }, { status: 400 });

  const existing = await prisma.favorite.findUnique({
    where: { userId_videoId: { userId: session.user.id, videoId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  } else {
    await prisma.favorite.create({ data: { userId: session.user.id, videoId } });
    return NextResponse.json({ favorited: true });
  }
}
