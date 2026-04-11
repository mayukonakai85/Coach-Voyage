import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const list = await prisma.watchLater.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      video: {
        select: {
          id: true, title: true, description: true, thumbnailUrl: true,
          publishedAt: true, recordedAt: true, sortOrder: true,
        },
      },
    },
  });

  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { videoId } = await req.json();
  if (!videoId) return NextResponse.json({ error: "videoId required" }, { status: 400 });

  const existing = await prisma.watchLater.findUnique({
    where: { userId_videoId: { userId: session.user.id, videoId } },
  });

  if (existing) {
    await prisma.watchLater.delete({ where: { id: existing.id } });
    return NextResponse.json({ added: false });
  } else {
    await prisma.watchLater.create({ data: { userId: session.user.id, videoId } });
    return NextResponse.json({ added: true });
  }
}
