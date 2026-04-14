import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendPaymentEmail } from "@/lib/email";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await sendPaymentEmail({ to: user.email, name: user.name });
  } catch (err) {
    console.error("Payment email error:", err);
    return NextResponse.json(
      { error: `メール送信に失敗しました: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }

  await prisma.user.update({
    where: { id: params.id },
    data: { paymentEmailSentAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
