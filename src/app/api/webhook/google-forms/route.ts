import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  // Bearer トークン認証
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace("Bearer ", "");
  if (token !== process.env.GOOGLE_FORMS_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const formData = {
    name: body.name?.trim() || undefined,
    nameRoman: body.nameRoman?.trim() || undefined,
    address: body.address?.trim() || undefined,
    birthDate: body.birthDate?.trim() || undefined,
    phone: body.phone?.trim() || undefined,
    companyName: body.companyName?.trim() || undefined,
    companyNameKana: body.companyNameKana?.trim() || undefined,
    website: body.website?.trim() || undefined,
    referrer: body.referrer?.trim() || undefined,
    coachingSchool: body.coachingSchool?.trim() || undefined,
    coachingHours: body.coachingHours?.trim() || undefined,
    coachingCertifications: body.coachingCertifications?.trim() || undefined,
    formSubmittedAt: new Date(),
  };

  // メールアドレスでユーザーを検索して更新、存在しなければ仮登録
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: formData,
    });
    return NextResponse.json({ status: "updated", userId: existing.id });
  } else {
    // アカウント未作成の場合：仮登録（isActive: false、password は後で招待時に設定）
    const newUser = await prisma.user.create({
      data: {
        email,
        name: formData.name ?? email,
        password: "", // 招待メール経由でパスワード設定させる
        isActive: false,
        ...formData,
      },
    });
    return NextResponse.json({ status: "created", userId: newUser.id });
  }
}
