"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import EnablePush from "@/components/EnablePush";

interface Notification {
  id: string;
  postExcerpt: string;
  read: boolean;
  createdAt: number;
}

export default function NotificationsPage() {
  const { user, t, ready, refreshUnread } = useApp();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[] | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setNotifications(data.notifications);
        // Everything is now seen — mark as read.
        if (data.unread > 0) {
          fetch("/api/notifications", { method: "POST" })
            .then(() => refreshUnread())
            .catch(() => {});
        }
      })
      .catch(() => setNotifications([]));
  }, [ready, user, router, refreshUnread]);

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleString();

  return (
    <>
      <h1 className="page-title">{t.notifTitle}</h1>
      <div style={{ margin: "6px 0 4px" }}>
        <EnablePush />
      </div>
      {notifications === null ? (
        <div className="empty-state">
          <div className="spinner" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">🕊️ {t.notifEmpty}</div>
      ) : (
        <div className="card" style={{ padding: "4px 16px" }}>
          {notifications.map((n) => (
            <div key={n.id} className={`notif-item${n.read ? "" : " unread"}`}>
              <span className="notif-icon">🙏</span>
              <div className="notif-text">
                {t.notifPrayed}
                {n.postExcerpt && (
                  <span className="notif-excerpt">“{n.postExcerpt}”</span>
                )}
              </div>
              <span className="notif-time">{formatTime(n.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
