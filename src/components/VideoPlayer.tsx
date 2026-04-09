"use client";

import { useEffect, useRef } from "react";

export function VideoPlayer({
  src,
  title,
  videoId,
}: {
  src: string;
  title: string;
  videoId: string;
}) {
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;

    // iframeが読み込まれたら視聴済みとして記録
    // （Bunny.netのiframeは再生イベントを外部から取れないため、
    //   ページを開いた時点で視聴済みとみなす）
    const timer = setTimeout(async () => {
      if (recorded.current) return;
      recorded.current = true;

      try {
        await fetch(`/api/videos/${videoId}/view`, { method: "POST" });
      } catch (e) {
        console.error("視聴記録に失敗しました", e);
      }
    }, 3000); // 3秒後に記録（誤クリック防止）

    return () => clearTimeout(timer);
  }, [videoId]);

  return (
    <iframe
      src={src}
      loading="lazy"
      className="w-full h-full"
      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      title={title}
    />
  );
}
