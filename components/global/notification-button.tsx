"use client";

import React, { useState } from "react";
import { Bell, BellOff, Loader2, CheckCircle2 } from "lucide-react";
import { useCSWNotifications } from "@codeswayam/auth";
import { toast } from "sonner";

interface NotificationButtonProps {
  className?: string;
  size?: "default" | "sm";
}

export default function NotificationButton({ className, size = "default" }: NotificationButtonProps) {
  const {
    isSubscribed,
    isLoading,
    permission,
    isSupported,
    subscribe,
    unsubscribe,
    error,
  } = useCSWNotifications({ saasId: "auraflow" });

  const [showMenu, setShowMenu] = useState(false);

  const handleClick = async () => {
    if (!isSupported) {
      toast.error("Push notifications are not supported in this browser.");
      return;
    }

    if (permission === "denied") {
      toast.error(
        "Notifications blocked in browser. Click the site settings icon in your address bar to allow notifications."
      );
      return;
    }

    if (isSubscribed) {
      setShowMenu((prev) => !prev);
      return;
    }

    try {
      toast.loading("Subscribing to notifications...", { id: "notif-action" });
      await subscribe();
      toast.success("Subscribed! You will receive push notifications for automations & leads.", { id: "notif-action" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to subscribe to notifications.", { id: "notif-action" });
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setShowMenu(false);
      toast.loading("Unsubscribing...", { id: "notif-action" });
      await unsubscribe();
      toast.info("Unsubscribed from push notifications.", { id: "notif-action" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to unsubscribe.", { id: "notif-action" });
    }
  };

  const handleTest = () => {
    setShowMenu(false);
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("Auraflow Notification", {
        body: "Your notifications are active! You will receive updates when your automations run.",
        icon: "/icon-192.png",
      });
      toast.success("Test notification dispatched!");
    } else {
      toast.info("Notification sent!");
    }
  };

  const btnClasses = size === "sm"
    ? "relative w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/20 transition-all group"
    : "relative w-11 h-11 rounded-2xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/20 transition-all group";

  const iconClasses = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isLoading}
        type="button"
        aria-label="Notification settings"
        title={
          permission === "denied"
            ? "Notifications blocked in browser"
            : isSubscribed
            ? "Notifications active — click to manage"
            : "Click to subscribe to push notifications"
        }
        className={`${btnClasses} ${className || ""}`}
      >
        {isLoading ? (
          <Loader2 className={`${iconClasses} animate-spin text-primary`} />
        ) : permission === "denied" ? (
          <BellOff className={`${iconClasses} text-destructive/70 group-hover:text-destructive`} />
        ) : isSubscribed ? (
          <Bell className={`${iconClasses} text-primary group-hover:scale-110 transition-transform`} />
        ) : (
          <Bell className={`${iconClasses} group-hover:scale-110 transition-transform`} />
        )}

        {/* Status indicator dot */}
        {permission === "denied" ? (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border border-background" />
        ) : isSubscribed ? (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border border-background animate-pulse" />
        ) : (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border border-background" />
        )}
      </button>

      {/* Popover Menu for Subscribed User */}
      {showMenu && isSubscribed && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-60 p-3 bg-white border border-border rounded-2xl shadow-xl z-50">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">Notifications Active</p>
                <p className="text-[10px] text-muted-foreground">Subscribed to Auraflow alerts</p>
              </div>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={handleTest}
                className="w-full text-left px-2.5 py-1.5 text-xs rounded-xl hover:bg-secondary text-foreground font-medium transition-colors cursor-pointer"
              >
                Send Test Alert
              </button>
              <button
                type="button"
                onClick={handleUnsubscribe}
                className="w-full text-left px-2.5 py-1.5 text-xs rounded-xl hover:bg-destructive/10 text-destructive font-medium transition-colors cursor-pointer"
              >
                Unsubscribe
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
