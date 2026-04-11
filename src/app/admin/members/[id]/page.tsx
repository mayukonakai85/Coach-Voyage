import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function MemberDetailPage({ params }: { params: { id: string } }) {
  const member = await prisma.user.findUnique({
    where: { id: params.id },
    include: { tags: { include: { tag: true } } },
  });

  if (!member) notFound();

  const formFields = [
    { label: "お名前（ローマ字）", value: member.nameRoman },
    { label: "住所", value: member.address },
    { label: "生年月日", value: member.birthDate },
    { label: "携帯電話番号", value: member.phone },
    { label: "会社名 / 屋号", value: member.companyName },
    { label: "会社名 / 屋号（カナ）", value: member.companyNameKana },
    { label: "ホームページ", value: member.website },
    { label: "紹介者", value: member.referrer },
    { label: "コーチングスクール / 講座", value: member.coachingSchool },
    { label: "コーチング実績（時間）", value: member.coachingHours },
    { label: "保持しているコーチング資格", value: member.coachingCertifications },
  ];

  const profileFields = [
    { label: "自己紹介", value: member.bio },
    { label: "学習開始時期", value: member.learningSince },
    { label: "興味関心タグ", value: member.tags.map((t) => t.tag.name).join(", ") || null },
  ];

  let contentRequest: { type?: string; theme?: string; detail?: string } | null = null;
  if (member.contentRequest) {
    try {
      contentRequest = JSON.parse(member.contentRequest);
    } catch {
      contentRequest = { detail: member.contentRequest };
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Link href="/admin/members" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{member.name}</h1>
          <p className="text-sm text-gray-400">{member.email}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {member.formSubmittedAt && (
            <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
              フォーム取得済
            </span>
          )}
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
            member.isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
          }`}>
            {member.isActive ? "会員" : "退会済"}
          </span>
        </div>
      </div>

      {/* Googleフォームデータ */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="font-bold text-gray-800 text-sm">入会申込フォームデータ</h2>
          {member.formSubmittedAt && (
            <span className="text-xs text-gray-400 ml-auto">
              {new Date(member.formSubmittedAt).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}送信
            </span>
          )}
        </div>

        {formFields.some((f) => f.value) ? (
          <dl className="space-y-3">
            {formFields.map((f) =>
              f.value ? (
                <div key={f.label} className="grid grid-cols-[10rem_1fr] gap-2 text-sm">
                  <dt className="text-gray-400 font-medium shrink-0">{f.label}</dt>
                  <dd className="text-gray-800 break-words">
                    {f.label === "ホームページ" ? (
                      <a href={f.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{f.value}</a>
                    ) : f.value}
                  </dd>
                </div>
              ) : null
            )}
          </dl>
        ) : (
          <p className="text-sm text-gray-400">フォームデータが未取得です</p>
        )}
      </div>

      {/* プロフィール（メンバーが入力したデータ） */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 className="font-bold text-gray-800 text-sm">プロフィール（メンバー入力）</h2>
        </div>
        <dl className="space-y-3">
          {profileFields.map((f) => (
            <div key={f.label} className="grid grid-cols-[10rem_1fr] gap-2 text-sm">
              <dt className="text-gray-400 font-medium shrink-0">{f.label}</dt>
              <dd className="text-gray-800 break-words whitespace-pre-wrap">{f.value ?? <span className="text-gray-300">未入力</span>}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* コンテンツリクエスト */}
      {contentRequest && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h2 className="font-bold text-gray-800 text-sm">コンテンツリクエスト</h2>
          </div>
          <dl className="space-y-3 text-sm">
            {contentRequest.type && (
              <div className="grid grid-cols-[10rem_1fr] gap-2">
                <dt className="text-gray-400 font-medium">種別</dt>
                <dd><span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">{contentRequest.type}</span></dd>
              </div>
            )}
            {contentRequest.theme && (
              <div className="grid grid-cols-[10rem_1fr] gap-2">
                <dt className="text-gray-400 font-medium">テーマ</dt>
                <dd className="text-gray-800">{contentRequest.theme}</dd>
              </div>
            )}
            {contentRequest.detail && (
              <div className="grid grid-cols-[10rem_1fr] gap-2">
                <dt className="text-gray-400 font-medium">知りたいこと</dt>
                <dd className="text-gray-800 whitespace-pre-wrap">{contentRequest.detail}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* 基本情報 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="font-bold text-gray-800 text-sm">基本情報</h2>
        </div>
        <dl className="space-y-3 text-sm">
          {[
            { label: "権限", value: member.role === "ADMIN" ? "管理者" : "一般会員" },
            { label: "入会月", value: member.joinedMonth ? (() => { const [y,m] = member.joinedMonth!.split("-"); return `${y}年${parseInt(m)}月`; })() : null },
            { label: "ログイン回数", value: `${member.loginCount}回` },
            { label: "最終ログイン", value: member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleString("ja-JP", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : null },
            { label: "招待日", value: member.invitedAt ? new Date(member.invitedAt).toLocaleDateString("ja-JP") : null },
            { label: "アカウント作成日", value: new Date(member.createdAt).toLocaleDateString("ja-JP") },
          ].map((f) => (
            <div key={f.label} className="grid grid-cols-[10rem_1fr] gap-2">
              <dt className="text-gray-400 font-medium">{f.label}</dt>
              <dd className="text-gray-800">{f.value ?? <span className="text-gray-300">未設定</span>}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
