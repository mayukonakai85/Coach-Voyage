/**
 * Bunny.net の動画一覧を取得してDBに登録・更新するスクリプト
 * コレクション名をサイトのカテゴリに自動マッピングします
 * 実行: DATABASE_URL="file:./dev.db" npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/import-bunny.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LIBRARY_ID = process.env.BUNNY_LIBRARY_ID || "634058";
const API_KEY = process.env.BUNNY_API_KEY || "19ab936f-f868-41ef-99773050a9e0-c5d7-4300";

async function fetchJson(path: string) {
  const res = await fetch(`https://video.bunnycdn.com/library/${LIBRARY_ID}/${path}`, {
    headers: { AccessKey: API_KEY },
  });
  if (!res.ok) throw new Error(`API エラー: ${res.status} ${path}`);
  return res.json();
}

async function main() {
  // コレクション一覧を取得（collectionId → カテゴリ名のマップを作る）
  console.log("📡 コレクション一覧を取得中...");
  const collectionData = await fetchJson("collections?includeThumbnails=false") as {
    items: Array<{ guid: string; name: string }>;
  };

  const collectionMap: Record<string, string> = {};
  for (const col of collectionData.items) {
    collectionMap[col.guid] = col.name;
    console.log(`  📁 ${col.name} (${col.guid})`);
  }

  // 動画一覧を取得
  console.log("\n📡 動画一覧を取得中...");
  const videoData = await fetchJson("videos?itemsPerPage=100") as {
    items: Array<{
      guid: string;
      title: string;
      collectionId: string;
      dateUploaded: string;
      status: number;
    }>;
  };
  console.log(`✅ ${videoData.items.length} 本の動画を取得しました\n`);

  let imported = 0;
  let updated = 0;

  for (const video of videoData.items) {
    const rawTitle = video.title.replace(/\.mp4$/i, "");

    // 先頭の数字を sortOrder として取得
    // 対応パターン:
    //   "1_タイトル"        → sortOrder: 1
    //   "20250803_タイトル" → sortOrder: 20250803（日付形式、降順で新しい順になる）
    const numMatch = rawTitle.match(/^(\d+)[_\-\.\s]+/);
    const sortOrder = numMatch ? parseInt(numMatch[1], 10) : 999;

    // タイトルのクリーニング:
    //   1. 先頭の番号・日付部分を除去（区切り文字なしでも対応）
    //   2. 【カテゴリ名】タグを除去（例: 【Coaching doc】）
    //   3. 残った先頭の記号・空白を除去
    const cleanTitle = rawTitle
      .replace(/^\d+[_\-\.\s]*/, "")           // 先頭の番号（区切り文字含む）を除去
      .replace(/【[^】]*】/g, "")               // 【○○】タグを除去
      .replace(/^[\s_\-\.]+/, "")              // 残った先頭記号を除去
      .trim();

    // コレクションIDからカテゴリ名を解決
    const category = collectionMap[video.collectionId] || "uncategorized";

    const existing = await prisma.video.findFirst({
      where: { bunnyVideoId: video.guid },
    });

    if (existing) {
      await prisma.video.update({
        where: { id: existing.id },
        data: { title: cleanTitle, sortOrder, category },
      });
      console.log(`🔄 更新: [${sortOrder}] ${cleanTitle} → ${category}`);
      updated++;
    } else {
      await prisma.video.create({
        data: {
          title: cleanTitle,
          description: "",
          bunnyVideoId: video.guid,
          sortOrder,
          category,
          publishedAt: new Date(video.dateUploaded),
          isPublished: true,
        },
      });
      console.log(`✅ 登録: [${sortOrder}] ${cleanTitle} → ${category}`);
      imported++;
    }
  }

  console.log(`\n🎉 完了！ 登録: ${imported}本 / 更新: ${updated}本`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
