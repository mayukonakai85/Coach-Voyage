// メンバー向け動画の表示条件
// isPublished: true かつ schedulePublishAt が null または過去の日時
export function memberVideoFilter(extra?: Record<string, unknown>) {
  const now = new Date();
  return {
    isPublished: true,
    OR: [
      { schedulePublishAt: null },
      { schedulePublishAt: { lte: now } },
    ],
    ...extra,
  };
}
