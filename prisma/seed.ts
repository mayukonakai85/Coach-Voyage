import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 シードデータを投入中...");

  // 管理者アカウント
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

  // サンプル会員
  const memberPassword = await bcrypt.hash("member123", 12);
  const member1 = await prisma.user.upsert({
    where: { email: "yamada@example.com" },
    update: {},
    create: {
      email: "yamada@example.com",
      password: memberPassword,
      name: "山田 太郎",
      role: "MEMBER",
      isActive: true,
    },
  });
  const member2 = await prisma.user.upsert({
    where: { email: "suzuki@example.com" },
    update: {},
    create: {
      email: "suzuki@example.com",
      password: memberPassword,
      name: "鈴木 花子",
      role: "MEMBER",
      isActive: true,
    },
  });
  console.log("✅ 会員アカウント作成:", member1.email, member2.email);

  // ダミー動画データ
  // ※ bunnyVideoId は実際の Bunny.net 動画IDに差し替えてください
  const videos = [
    {
      title: "コーチングの基礎：傾聴の技術",
      description:
        "効果的なコーチングに欠かせない傾聴スキルについて、具体的なテクニックを交えながら解説します。クライアントの言葉の奥にある感情や意図を読み取る力を養いましょう。",
      bunnyVideoId: "dummy-video-id-001",
      publishedAt: new Date("2024-10-01"),
      isPublished: true,
    },
    {
      title: "強力な質問の作り方",
      description:
        "クライアントの気づきを促す「強力な質問」の構造と使い方を学びます。オープンクエスチョンとクローズドクエスチョンの使い分け、深掘りの質問パターンを実例付きで紹介。",
      bunnyVideoId: "dummy-video-id-002",
      publishedAt: new Date("2024-10-15"),
      isPublished: true,
    },
    {
      title: "目標設定セッションの進め方",
      description:
        "SMARTゴールを活用した目標設定の具体的なセッション進行方法を解説。クライアント自身が主体的に目標を定め、行動計画を立てられるよう支援するためのフレームワークを紹介します。",
      bunnyVideoId: "dummy-video-id-003",
      publishedAt: new Date("2024-11-01"),
      isPublished: true,
    },
    {
      title: "コーチング契約と倫理",
      description:
        "プロフェッショナルコーチとして知っておくべき契約の取り交わし方、守秘義務、ICFの倫理規定について丁寧に解説します。",
      bunnyVideoId: "dummy-video-id-004",
      publishedAt: new Date("2024-11-20"),
      isPublished: true,
    },
    {
      title: "オンラインコーチングの実践",
      description:
        "対面ではなくオンラインでコーチングを行う際のポイント、テクニカルな準備、ラポール形成の工夫について解説します。",
      bunnyVideoId: "dummy-video-id-005",
      publishedAt: new Date("2024-12-01"),
      isPublished: false, // 非公開（管理者のみ確認可）
    },
  ];

  for (const video of videos) {
    const created = await prisma.video.upsert({
      where: { id: video.bunnyVideoId },
      update: video,
      create: { id: video.bunnyVideoId, ...video },
    });
    console.log("✅ 動画作成:", created.title);
  }

  console.log("\n🎉 シード完了！");
  console.log("-------------------");
  console.log("管理者ログイン情報:");
  console.log("  Email: admin@coachvoyage.com");
  console.log("  Password: admin123");
  console.log("\n会員ログイン情報:");
  console.log("  Email: yamada@example.com");
  console.log("  Password: member123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
