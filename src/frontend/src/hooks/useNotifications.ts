import { useEffect, useState } from "react";

export function useNotifications(isLoggedIn: boolean) {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default",
  );

  useEffect(() => {
    if (!isLoggedIn) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      Notification.requestPermission().then((p) => setPermission(p));
    }
  }, [isLoggedIn]);

  return { permission };
}

export function sendNotification(
  title: string,
  body: string,
  icon = "/assets/uploads/8CF45E72-C5D1-4FC7-8FF4-F25F3252F920-1.png",
) {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon });
  } catch {
    // ServiceWorker-less fallback — silently ignore
  }
}
