import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "ファイルがありません" }, { status: 400 });

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "画像ファイルを選択してください" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "5MB以下の画像を選択してください" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `avatars/${session.user.id}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    allowOverwrite: true,
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: blob.url },
  });

  return NextResponse.json({ avatarUrl: blob.url });
}
