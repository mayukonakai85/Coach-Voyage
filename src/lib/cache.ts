import { unstable_cache } from "next/cache";
import { prisma } from "./db";
import { memberVideoFilter } from "./videoFilter";

// 動画カテゴリ件数（管理者が動画を追加・更新したときにrevalidate）
export const getCachedVideoCounts = unstable_cache(
  async () =>
    prisma.video.groupBy({
      by: ["category"],
      where: memberVideoFilter(),
      _count: { id: true },
    }),
  ["video-counts"],
  { tags: ["videos"], revalidate: 3600 }
);

// 人気動画TOP3
export const getCachedTopVideos = unstable_cache(
  async () =>
    prisma.video.findMany({
      where: memberVideoFilter(),
      include: {
        _count: { select: { views: true } },
        lecturers: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { views: { _count: "desc" } },
      take: 3,
    }),
  ["top-videos"],
  { tags: ["videos"], revalidate: 3600 }
);

// セミナー一覧（今後の分）
export const getCachedUpcomingSeminars = unstable_cache(
  async (now: string) =>
    prisma.seminar.findMany({
      where: { scheduledAt: { gte: new Date(now) } },
      orderBy: { scheduledAt: "asc" },
      select: {
        id: true, title: true, description: true, scheduledAt: true, endsAt: true,
        zoomUrl: true, location: true, isOnline: true, isNext: true,
        lecturers: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true, name: true, photoUrl: true, bio: true,
            user: { select: { avatarUrl: true, title: true } },
          },
        },
      },
    }),
  ["upcoming-seminars"],
  { tags: ["seminars"], revalidate: 300 }
);

// 次回セミナー
export const getCachedNextSeminar = unstable_cache(
  async () =>
    prisma.seminar.findFirst({
      where: { isNext: true },
      include: {
        lecturers: {
          orderBy: { sortOrder: "asc" },
          include: { user: { select: { avatarUrl: true, title: true } } },
        },
      },
    }),
  ["next-seminar"],
  { tags: ["seminars"], revalidate: 300 }
);

// タグ一覧
export const getCachedTags = unstable_cache(
  async () =>
    prisma.tag.findMany({ orderBy: { sortOrder: "asc" } }),
  ["tags"],
  { tags: ["tags"], revalidate: 3600 }
);

// メンバー一覧（プロフィール更新時にrevalidate）
export const getCachedMembers = unstable_cache(
  async () =>
    prisma.user.findMany({
      where: { OR: [{ isActive: true }, { role: "ADMIN" }] },
      select: {
        id: true,
        name: true,
        bio: true,
        avatarUrl: true,
        role: true,
        title: true,
        createdAt: true,
        _count: { select: { views: true, comments: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ["members"],
  { tags: ["members"], revalidate: 60 }
);
