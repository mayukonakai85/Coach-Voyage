export default function TutorialPage() {
  const sections = [
    {
      icon: "👥",
      title: "会員管理",
      href: "/admin/members",
      steps: [
        "「会員管理」から会員一覧を確認できます",
        "「招待する」ボタンをクリックするとメールアドレスを入力して招待メールを送れます",
        "招待されたメンバーはメール内のリンクから初回パスワードを設定してログインします",
        "「利用停止」ボタンでアカウントを無効化できます（メンバーはログインできなくなります）",
        "役職（タイトル）はメンバー一覧ページに表示されます",
      ],
    },
    {
      icon: "🎬",
      title: "動画管理",
      href: "/admin/videos",
      steps: [
        "「動画管理」から動画の追加・編集・削除ができます",
        "動画を追加するには Bunny.net の動画IDが必要です",
        "Bunny.net → Stream → ライブラリ → 動画を選択 → 動画IDをコピーして貼り付けてください",
        "「予約公開日時」を設定すると、指定した日時になった時点で自動的にメンバーに公開されます",
        "「公開する」チェックを外すと非公開（メンバーには表示されません）",
        "カテゴリと表示順を設定してライブラリを整理できます",
      ],
    },
    {
      icon: "📅",
      title: "セミナー管理",
      href: "/admin/seminars",
      steps: [
        "「セミナー管理」から予定の追加・編集・削除ができます",
        "「次回セミナー」にチェックを入れるとホーム画面の上部バナーに表示されます",
        "Zoom URLを設定するとメンバーがワンクリックで参加できます",
        "日程はホーム画面のカレンダーに自動反映されます",
      ],
    },
    {
      icon: "🏷️",
      title: "タグ管理",
      href: "/admin/tags",
      steps: [
        "「タグ管理」から興味関心タグの追加・編集・削除ができます",
        "タグはメンバーが初回ログイン時のアンケートや、プロフィール設定で選択できます",
        "各タグには選択しているメンバー数が表示されます",
        "タグを削除すると、そのタグを選択しているメンバーのデータからも削除されます",
      ],
    },
    {
      icon: "📊",
      title: "視聴データ",
      href: "/admin/analytics",
      steps: [
        "「視聴データ」から各動画の視聴回数・視聴者数を確認できます",
        "人気動画ランキングやメンバーの視聴履歴を分析できます",
      ],
    },
    {
      icon: "📦",
      title: "Bunny.net 動画インポート",
      href: "/admin",
      steps: [
        "管理トップの「Bunny.net から動画をインポート」ボタンで Bunny.net 上の動画を一括取り込みできます",
        "すでに登録済みの動画はスキップされます",
        "新しく Bunny.net にアップロードした動画を追加したいときに使います",
      ],
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">管理者ガイド</h1>
        <p className="text-gray-500 mt-1">各機能の使い方をまとめています</p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {sections.map((section) => (
          <div key={section.title} className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{section.icon}</span>
              <h2 className="font-bold text-gray-900 text-lg">{section.title}</h2>
            </div>
            <ol className="space-y-2">
              {section.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
