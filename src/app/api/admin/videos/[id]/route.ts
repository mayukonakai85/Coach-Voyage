import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

// 動画更新
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, description, bunnyVideoId, thumbnailUrl, category, sortOrder, publishedAt, isPublished, schedulePublishAt } = body;

    if (!title || !bunnyVideoId) {
      return NextResponse.json(
        { error: "タイトル・動画IDは必須です" },
        { status: 400 }
      );
    }

    const video = await prisma.video.update({
      where: { id: params.id },
      data: {
        title,
        description: description || "",
        bunnyVideoId,
        thumbnailUrl: thumbnailUrl || null,
        category: category || "uncategorized",
        sortOrder: sortOrder ?? 0,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        isPublished: isPublished ?? true,
        schedulePublishAt: schedulePublishAt ? new Date(schedulePublishAt + ":00:00+09:00") : null,
      },
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error("Video update error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

// 動画削除
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.video.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Video delete error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
