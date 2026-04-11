import Link from "next/link";

export function LibraryTabs({ active }: { active: "all" | "favorites" | "watch-later" }) {
  const tabs = [
    {
      key: "all",
      href: "/videos",
      label: "すべて",
      icon: null,
    },
    {
      key: "favorites",
      href: "/favorites",
      label: "お気に入り",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
    },
    {
      key: "watch-later",
      href: "/watch-later",
      label: "後で見る",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ] as const;

  return (
    <div className="flex gap-2 mb-8 border-b border-gray-200">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px flex items-center gap-1.5 transition-colors ${
              isActive
                ? "font-bold text-blue-700 border-blue-600"
                : "text-gray-500 hover:text-gray-800 border-transparent"
            }`}
          >
            {tab.icon}
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
