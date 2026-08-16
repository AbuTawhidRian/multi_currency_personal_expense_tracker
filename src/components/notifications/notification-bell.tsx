"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  AlertOctagon,
  Info,
  ExternalLink,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  NotificationItem,
} from "@/actions/notification";

export function NotificationBell({ className = "" }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchLatest = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    }
  };

  useEffect(() => {
    fetchLatest();

    // Poll every 45 seconds to keep notifications updated
    const interval = setInterval(fetchLatest, 45000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await markAllNotificationsAsRead();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (item && !item.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    await deleteNotification(id);
  };

  const handleClearAll = async () => {
    setNotifications([]);
    setUnreadCount(0);
    await clearAllNotifications();
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.isRead;
    return true;
  });

  const formatRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const renderIcon = (title: string, type: string) => {
    if (title.includes("Exceeded") || type === "BUDGET_EXCEEDED") {
      return (
        <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0">
          <AlertOctagon className="w-4 h-4" />
        </div>
      );
    }
    if (title.includes("Warning") || type === "BUDGET_ALERT") {
      return (
        <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="p-2 rounded-xl bg-primary/15 text-primary border border-primary/30 shrink-0">
        <Info className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchLatest();
        }}
        className={`relative p-2.5 rounded-xl border transition-all duration-200 focus:outline-none ${
          isOpen
            ? "bg-primary/15 border-primary/40 text-primary shadow-sm shadow-primary/20"
            : "bg-card hover:bg-muted border-border/60 text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-rose-500/50 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 sm:right-0 mt-2.5 w-[340px] sm:w-[400px] rounded-2xl bg-card border border-border/80 shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-border/60 bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                <p className="text-[11px] text-muted-foreground">
                  {unreadCount > 0
                    ? `${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}`
                    : "All alerts read"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="p-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1 font-medium"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Read all</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="p-1.5 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-muted/10 text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  filter === "ALL"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("UNREAD")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  filter === "UNREAD"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <button
              onClick={fetchLatest}
              className="text-muted-foreground hover:text-foreground text-[11px] flex items-center gap-1"
              title="Refresh alerts"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/30">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-foreground">You're all caught up!</p>
                <p className="text-xs text-muted-foreground">
                  {filter === "UNREAD"
                    ? "No unread alerts remaining."
                    : "Budget warnings and reminders will appear here."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                  className={`p-4 transition-colors relative group cursor-pointer ${
                    item.isRead
                      ? "bg-card/60 hover:bg-muted/30 opacity-80"
                      : "bg-muted/30 hover:bg-muted/50 border-l-2 border-primary"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {renderIcon(item.title, item.type)}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-xs font-semibold truncate ${
                            item.title.includes("Exceeded")
                              ? "text-rose-400 font-bold"
                              : item.title.includes("Warning")
                              ? "text-amber-400 font-bold"
                              : "text-foreground"
                          }`}
                        >
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {item.message}
                      </p>

                      {/* Bottom Alert Link & Actions */}
                      <div className="pt-1.5 flex items-center justify-between text-[11px]">
                        {item.type === "BUDGET_ALERT" ? (
                          <Link
                            href="/budgets"
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                          >
                            <span>View Budget</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span />
                        )}

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!item.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(item.id);
                              }}
                              className="text-muted-foreground hover:text-foreground text-[10px] underline"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(item.id, e)}
                            className="text-muted-foreground hover:text-destructive p-0.5 rounded"
                            title="Delete alert"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-muted/40 border-t border-border/60 text-center">
            <Link
              href="/budgets"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1.5"
            >
              <span>Manage all budgets and targets</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
