"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";

export function NavAvatar({ name, fallbackUrl }: { name: string; fallbackUrl: string | null }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(fallbackUrl);

  useEffect(() => {
    // 最新のアバターURLをAPIから取得
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data?.avatarUrl) setAvatarUrl(data.avatarUrl + "?t=" + Date.now());
      })
      .catch(() => {});
  }, []);

  return <Avatar name={name} avatarUrl={avatarUrl} size="sm" />;
}
