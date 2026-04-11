import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

// 会員ステータスの有効化・無効化
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { isActive, role, title, joinedMonth } = body;

    // 自分自身の管理者権限は剥奪不可
    if (role === "MEMBER" && params.id === session.user.id) {
      return NextResponse.json({ error: "自分の管理者権限は変更できません" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (role === "ADMIN" || role === "MEMBER") updateData.role = role;
    if (title !== undefined) updateData.title = title?.trim() || null;
    if (joinedMonth !== undefined) updateData.joinedMonth = joinedMonth?.trim() || null;

    const member = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, email: true, name: true, isActive: true, role: true, title: true, joinedMonth: true },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("Member update error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
