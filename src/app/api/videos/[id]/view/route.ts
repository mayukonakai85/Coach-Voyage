import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// 再生開始時に呼ばれる → 視聴済みとして記録
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.videoView.upsert({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId: params.id,
        },
      },
      update: {
        viewedAt: new Date(), // 最終視聴日を更新
      },
      create: {
        userId: session.user.id,
        videoId: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
