import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// タグ一覧（全員が取得可）
export async function GET() {
  const tags = await prisma.tag.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(tags);
}
