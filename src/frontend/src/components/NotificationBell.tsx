import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Bell, Check, Gift, MessageCircle, Star, UserPlus } from "lucide-react";
import { useEffect, useRef } from "react";
import type {
  backendInterface as FullBackend,
  Notification,
} from "../backend.d";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsList,
  useUnreadNotificationCount,
} from "../hooks/useQueries";

function timeAgo(timestamp: bigint): string {
  const now = Date.now();
  const diff = now - Number(timestamp / BigInt(1_000_000));
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function notifIcon(type: string) {
  if (type.includes("friend"))
    return <UserPlus className="w-4 h-4 text-blue-500" />;
  if (type.includes("badge"))
    return <Star className="w-4 h-4 text-yellow-500" />;
  if (type.includes("question"))
    return <MessageCircle className="w-4 h-4 text-green-500" />;
  if (type.includes("like") || type.includes("comment"))
    return <MessageCircle className="w-4 h-4 text-pink-500" />;
  return <Gift className="w-4 h-4 text-purple-500" />;
}

export function NotificationBell() {
  const { userId } = useAuth();
  const { actor: rawActor } = useActor();
  const actor = rawActor as unknown as FullBackend | null;

  const { data: notifications = [] } = useNotificationsList(userId);
  const { data: unreadCount = BigInt(0) } = useUnreadNotificationCount(userId);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  // Poll every 30s
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { refetch: refetchNotifs } = useNotificationsList(userId);
  const { refetch: refetchCount } = useUnreadNotificationCount(userId);

  useEffect(() => {
    if (!userId || !actor) return;
    pollRef.current = setInterval(() => {
      refetchNotifs();
      refetchCount();
    }, 30_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [userId, actor, refetchNotifs, refetchCount]);

  if (!userId) return null;

  const handleMarkRead = async (notif: Notification) => {
    if (!notif.isRead) {
      await markRead.mutateAsync(notif.id);
    }
  };

  const handleMarkAll = async () => {
    if (userId) {
      await markAllRead.mutateAsync(userId);
    }
  };

  const count = Number(unreadCount);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-ocid="nav.notifications.button"
          className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        data-ocid="nav.notifications.dropdown_menu"
        align="end"
        className="w-80 rounded-2xl p-0 shadow-xl"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-display font-semibold text-sm">Notifications</h3>
          {count > 0 && (
            <button
              type="button"
              data-ocid="notifications.mark_all.button"
              onClick={handleMarkAll}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div
              data-ocid="notifications.empty_state"
              className="py-8 text-center text-muted-foreground text-sm"
            >
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((notif, i) => (
                <div key={notif.id.toString()}>
                  <button
                    type="button"
                    data-ocid={`notifications.item.${i + 1}`}
                    onClick={() => handleMarkRead(notif)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
                      !notif.isRead ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {notifIcon(notif.notifType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-snug ${
                          !notif.isRead
                            ? "font-semibold text-foreground"
                            : "text-foreground/80"
                        }`}
                      >
                        {notif.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {timeAgo(notif.createdAt)} ago
                      </p>
                    </div>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    )}
                  </button>
                  {i < notifications.length - 1 && (
                    <Separator className="opacity-50" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
