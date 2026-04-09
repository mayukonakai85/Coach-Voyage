import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

// 動画一覧（管理者用・非公開含む）
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(videos);
}

// 動画追加
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, description, bunnyVideoId, thumbnailUrl, category, sortOrder, publishedAt, isPublished } = body;

    if (!title || !bunnyVideoId) {
      return NextResponse.json(
        { error: "タイトル・動画IDは必須です" },
        { status: 400 }
      );
    }

    const video = await prisma.video.create({
      data: {
        title,
        description: description || "",
        bunnyVideoId,
        thumbnailUrl: thumbnailUrl || null,
        category: category || "uncategorized",
        sortOrder: sortOrder ?? 0,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        isPublished: isPublished ?? true,
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Video create error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
