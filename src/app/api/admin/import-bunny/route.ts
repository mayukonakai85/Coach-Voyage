import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
const API_KEY = process.env.BUNNY_API_KEY;

async function fetchBunny(path: string) {
  const res = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/${path}`,
    { headers: { AccessKey: API_KEY! } }
  );
  if (!res.ok) throw new Error(`Bunny.net API エラー: ${res.status}`);
  return res.json();
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!LIBRARY_ID || !API_KEY) {
    return NextResponse.json(
      { error: "Bunny.net の環境変数が設定されていません" },
      { status: 500 }
    );
  }

  try {
    // コレクション一覧を取得
    const collectionData = await fetchBunny("collections?includeThumbnails=false") as {
      items: Array<{ guid: string; name: string }>;
    };
    const collectionMap: Record<string, string> = {};
    for (const col of collectionData.items) {
      collectionMap[col.guid] = col.name;
    }

    // 動画一覧を取得
    const videoData = await fetchBunny("videos?itemsPerPage=100") as {
      items: Array<{
        guid: string;
        title: string;
        collectionId: string;
        dateUploaded: string;
        status: number;
      }>;
    };

    let imported = 0;
    let updated = 0;
    let deleted = 0;
    const logs: string[] = [];

    // Bunny.net に存在する動画IDのセット
    const bunnyIds = new Set(videoData.items.map((v) => v.guid));

    // DBにあってBunny.netにない動画を削除
    const allDbVideos = await prisma.video.findMany({ select: { id: true, title: true, bunnyVideoId: true } });
    for (const dbVideo of allDbVideos) {
      if (!bunnyIds.has(dbVideo.bunnyVideoId)) {
        await prisma.video.delete({ where: { id: dbVideo.id } });
        logs.push(`削除: ${dbVideo.title}`);
        deleted++;
      }
    }

    // 追加・更新
    for (const video of videoData.items) {
      const rawTitle = video.title.replace(/\.mp4$/i, "");

      // 先頭の数字を解析
      const numMatch = rawTitle.match(/^(\d+)[_\-\.\s]*/);
      const numStr = numMatch ? numMatch[1] : null;

      // 8桁の数字（yyyymmdd形式）なら収録日として解析
      let recordedAt: Date | null = null;
      let sortOrder = 999;
      if (numStr && numStr.length === 8) {
        const y = numStr.slice(0, 4);
        const m = numStr.slice(4, 6);
        const d = numStr.slice(6, 8);
        const parsed = new Date(`${y}-${m}-${d}`);
        if (!isNaN(parsed.getTime())) {
          recordedAt = parsed;
          sortOrder = parseInt(numStr, 10); // 日付数値として降順ソートに使う
        }
      } else if (numStr) {
        sortOrder = parseInt(numStr, 10);
      }

      const cleanTitle = rawTitle
        .replace(/^\d+[_\-\.\s]*/, "")
        .replace(/【[^】]*】/g, "")
        .replace(/^[\s_\-\.]+/, "")
        .trim();

      const category = collectionMap[video.collectionId] || "uncategorized";
      const dateLabel = recordedAt
        ? recordedAt.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })
        : `#${sortOrder}`;

      const existing = await prisma.video.findFirst({
        where: { bunnyVideoId: video.guid },
      });

      if (existing) {
        await prisma.video.update({
          where: { id: existing.id },
          data: { title: cleanTitle, sortOrder, recordedAt, category },
        });
        logs.push(`更新: [${dateLabel}] ${cleanTitle} → ${category}`);
        updated++;
      } else {
        await prisma.video.create({
          data: {
            title: cleanTitle,
            description: "",
            bunnyVideoId: video.guid,
            sortOrder,
            recordedAt,
            category,
            publishedAt: new Date(video.dateUploaded),
            isPublished: true,
          },
        });
        logs.push(`登録: [${dateLabel}] ${cleanTitle} → ${category}`);
        imported++;
      }
    }

    return NextResponse.json({ imported, updated, deleted, logs });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "インポートに失敗しました" },
      { status: 500 }
    );
  }
}
