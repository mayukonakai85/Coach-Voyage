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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, description, scheduledAt, endsAt, zoomUrl, location, isOnline, isNext } = await req.json();

  if (isNext) {
    await prisma.seminar.updateMany({ where: { id: { not: params.id } }, data: { isNext: false } });
  }

  const seminar = await prisma.seminar.update({
    where: { id: params.id },
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
  return NextResponse.json(seminar);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.seminar.delete({ where: { id: params.id } });
  revalidateTag("seminars");
  return NextResponse.json({ success: true });
}
