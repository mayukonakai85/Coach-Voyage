"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ProfilePopup } from "./ProfilePopup";
import { EventPopup } from "./EventPopup";

type EventSettings = {
  isEnabled: boolean;
  title: string;
  body: string;
  buttonText: string;
  buttonUrl?: string | null;
};

type PopupState = "idle" | "profile" | "event" | "done";

export function LoginPopupManager() {
  const { data: session, status } = useSession();
  const [popupState, setPopupState] = useState<PopupState>("idle");
  const [eventSettings, setEventSettings] = useState<EventSettings | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session) return;

    const { id, loginCount, showProfilePopup } = session.user;

    // 同一ブラウザセッション内では再表示しない
    const storageKey = `popup_checked_${id}_${loginCount}`;
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, "1");

    const shouldShowProfile =
      loginCount === 1 ||
      loginCount === 3 ||
      showProfilePopup;

    fetch("/api/popup/event")
      .then((r) => r.json())
      .then((data: EventSettings) => {
        setEventSettings(data.isEnabled ? data : null);

        if (shouldShowProfile) {
          setPopupState("profile");
        } else if (data.isEnabled) {
          setPopupState("event");
        }
      })
      .catch(() => {
        if (shouldShowProfile) setPopupState("profile");
      });
  }, [status, session]);

  function handleProfileClose() {
    // 管理者が手動で設定した場合はDBのフラグをリセット
    if (session?.user.showProfilePopup) {
      fetch("/api/popup/dismiss-profile", { method: "POST" });
    }
    // イベントポップアップが有効なら次に表示
    if (eventSettings?.isEnabled) {
      setPopupState("event");
    } else {
      setPopupState("done");
    }
  }

  function handleEventClose() {
    setPopupState("done");
  }

  if (popupState === "profile") {
    return <ProfilePopup onClose={handleProfileClose} />;
  }
  if (popupState === "event" && eventSettings) {
    return <EventPopup settings={eventSettings} onClose={handleEventClose} />;
  }
  return null;
}
