import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

type FormRow = {
  email: string;
  name?: string;
  nameRoman?: string;
  address?: string;
  birthDate?: string;
  phone?: string;
  companyName?: string;
  companyNameKana?: string;
  website?: string;
  referrer?: string;
  coachingSchool?: string;
  coachingHours?: string;
  coachingCertifications?: string;
  formSubmittedAt?: string;
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { rows }: { rows: FormRow[] } = await req.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows" }, { status: 400 });
  }

  let updated = 0;
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const email = row.email?.trim().toLowerCase();
    if (!email) { skipped++; continue; }

    const submittedAt = row.formSubmittedAt ? new Date(row.formSubmittedAt) : new Date();
    const joinedMonth = submittedAt
      ? `${submittedAt.getFullYear()}-${String(submittedAt.getMonth() + 1).padStart(2, "0")}`
      : undefined;

    const nameValue = row.name?.trim() || undefined;
    const data = {
      nameRoman: row.nameRoman?.trim() || undefined,
      address: row.address?.trim() || undefined,
      birthDate: row.birthDate?.trim() || undefined,
      phone: row.phone?.trim() || undefined,
      companyName: row.companyName?.trim() || undefined,
      companyNameKana: row.companyNameKana?.trim() || undefined,
      website: row.website?.trim() || undefined,
      referrer: row.referrer?.trim() || undefined,
      coachingSchool: row.coachingSchool?.trim() || undefined,
      coachingHours: row.coachingHours?.trim() || undefined,
      coachingCertifications: row.coachingCertifications?.trim() || undefined,
      formSubmittedAt: submittedAt,
      joinedMonth,
    };

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        await prisma.user.update({ where: { email }, data: { ...data, ...(nameValue ? { name: nameValue } : {}) } });
        updated++;
      } else {
        await prisma.user.create({
          data: {
            email,
            name: nameValue ?? email,
            password: "",
            isActive: false,
            memberStatus: "PENDING",
            ...data,
          },
        });
        created++;
      }
    } catch (e) {
      errors.push(`${email}: ${e instanceof Error ? e.message : "不明なエラー"}`);
    }
  }

  return NextResponse.json({ updated, created, skipped, errors });
}
