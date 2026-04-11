import { prisma } from "@/lib/db";
import { EventPopupForm } from "./EventPopupForm";
import { ProfilePopupSender } from "./ProfilePopupSender";

export default async function AdminPopupPage() {
  const [settings, members] = await Promise.all([
    prisma.eventPopupSettings.findUnique({ where: { id: "singleton" } }),
    prisma.user.findMany({
      where: { role: "MEMBER", isActive: true },
      select: { id: true, name: true, email: true, loginCount: true, showProfilePopup: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const defaultSettings = settings ?? {
    isEnabled: false,
    title: "",
    body: "",
    buttonText: "詳細を見る",
    buttonUrl: null,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ポップアップ管理</h1>
        <p className="text-gray-500 mt-1 text-sm">ログイン直後に表示されるポップアップを管理します</p>
      </div>

      {/* ポップアップ①：プロフィール記入促進 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">①</span>
          <div>
            <h2 className="font-bold text-gray-800">プロフィール記入促進ポップアップ</h2>
            <p className="text-xs text-gray-400 mt-0.5">1回目・3回目のログイン時に全員へ自動表示。4回目以降は手動で対象者を指定</p>
          </div>
        </div>
        <ProfilePopupSender members={members} />
      </div>

      {/* ポップアップ②：イベント参加促進 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">②</span>
          <div>
            <h2 className="font-bold text-gray-800">イベント参加促進ポップアップ</h2>
            <p className="text-xs text-gray-400 mt-0.5">ONにすると全メンバーのログイン直後に表示されます</p>
          </div>
        </div>
        <EventPopupForm defaultSettings={defaultSettings} />
      </div>
    </div>
  );
}
