import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";
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

  const seminars = await prisma.seminar.findMany({ orderBy: { scheduledAt: "asc" } });
  return NextResponse.json(seminars);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, description, scheduledAt, endsAt, zoomUrl, location, isOnline, isNext } = await req.json();
  if (!title || !scheduledAt) {
    return NextResponse.json({ error: "タイトルと日時は必須です" }, { status: 400 });
  }

  if (isNext) await prisma.seminar.updateMany({ data: { isNext: false } });

  const seminar = await prisma.seminar.create({
    data: {
      title,
      description: description || null,
      scheduledAt: new Date(scheduledAt),
      endsAt: endsAt ? new Date(endsAt) : null,
      zoomUrl: zoomUrl || null,
      location: location || null,
      isOnline: isOnline ?? true,
      isNext: isNext ?? false,
    },
  });

  revalidateTag("seminars");
  return NextResponse.json(seminar, { status: 201 });
}
