import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 シードデータを投入中...");

  // 管理者アカウントのみ
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@coachvoyage.com" },
    update: {},
    create: {
      email: "admin@coachvoyage.com",
      password: adminPassword,
      name: "管理者",
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log("✅ 管理者アカウント作成:", admin.email);

  console.log("\n🎉 シード完了！");
  console.log("-------------------");
  console.log("管理者ログイン情報:");
  console.log("  Email: admin@coachvoyage.com");
  console.log("  Password: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
