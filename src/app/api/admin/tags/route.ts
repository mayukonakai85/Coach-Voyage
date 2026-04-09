import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const tags = await prisma.tag.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { users: true } } },
  });
  return NextResponse.json(tags);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "タグ名は必須です" }, { status: 400 });
  const count = await prisma.tag.count();
  const tag = await prisma.tag.create({ data: { name: name.trim(), sortOrder: count } });
  return NextResponse.json(tag, { status: 201 });
}
