export default function VideosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* モバイル検索バー（md未満のみ表示） */}
      <div className="md:hidden mb-4 -mt-2">
        <form action="/videos/search" method="get">
          <div className="relative">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              name="q"
              placeholder="動画を検索..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white shadow-sm"
            />
          </div>
        </form>
      </div>
      {children}
    </>
  );
}
