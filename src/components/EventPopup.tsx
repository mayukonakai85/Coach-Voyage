"use client";

type EventSettings = {
  title: string;
  body: string;
  buttonText: string;
  buttonUrl?: string | null;
};

export function EventPopup({ settings, onClose }: { settings: EventSettings; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-7 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors"
          aria-label="閉じる"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📅</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">{settings.title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">{settings.body}</p>
        </div>

        <div className="space-y-2">
          {settings.buttonUrl ? (
            <a
              href={settings.buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl transition-colors text-sm text-center"
            >
              {settings.buttonText}
            </a>
          ) : (
            <button
              onClick={onClose}
              className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
            >
              {settings.buttonText}
            </button>
          )}
          <button
            onClick={onClose}
            className="block w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
