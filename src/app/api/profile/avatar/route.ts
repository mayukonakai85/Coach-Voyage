import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "ファイルがありません" }, { status: 400 });

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "画像ファイルを選択してください" }, { status: 400 });
    }

    // 1MB 以下に制限（リサイズ後なので十分）
    if (file.size > 1 * 1024 * 1024) {
      return NextResponse.json({ error: "画像が大きすぎます。再度お試しください。" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: dataUrl },
    });

    return NextResponse.json({ avatarUrl: dataUrl });
  } catch (err) {
    console.error("Avatar upload error:", err);
    return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });
  }
}
