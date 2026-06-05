"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from "@/lib/api";

type AdminNotificationItem = {
  id: number;
  category: "registration" | "order" | "product";
  title: string;
  message: string;
  target_path?: string | null;
  is_read: boolean;
  createdAt: string;
};

type AdminNotificationsPayload = {
  unreadCount: number;
  items: AdminNotificationItem[];
};

export default function AdminNotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<AdminNotificationsPayload>({
    queryKey: ["admin-notifications-page"],
    queryFn: async () => {
      const res = await getAdminNotifications(100);
      const payload = res as { data?: AdminNotificationsPayload } | null;
      return payload?.data ?? { unreadCount: 0, items: [] };
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => markAdminNotificationRead(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-notifications-page"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-notifications-bell"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => markAllAdminNotificationsRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-notifications-page"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-notifications-bell"] });
    },
  });

  const notifications = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const handleNotificationClick = async (notification: AdminNotificationItem) => {
    if (!notification.is_read) {
      await markReadMutation.mutateAsync(notification.id);
    }

    if (notification.target_path) {
      router.push(notification.target_path);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            View admin activity for new registrations, orders, and product uploads.
          </p>
        </div>
        <button
          type="button"
          onClick={() => markAllReadMutation.mutate()}
          disabled={markAllReadMutation.isPending || unreadCount === 0}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mark all as read
        </button>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="px-6 py-10 text-sm text-slate-500">Loading notifications...</div>
        ) : isError ? (
          <div className="px-6 py-10 text-sm text-red-500">
            Failed to load notifications.
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">
            No notifications yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleNotificationClick(notification)}
                className={`flex w-full flex-col gap-2 px-6 py-4 text-left transition hover:bg-slate-50 ${
                  notification.is_read ? "bg-white" : "bg-amber-50/50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                          notification.category === "registration"
                            ? "bg-violet-100 text-violet-700"
                            : notification.category === "order"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-sky-100 text-sky-700"
                        }`}
                      >
                        {notification.category}
                      </span>
                      {!notification.is_read && (
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                      )}
                    </div>
                    <h2 className="mt-2 text-sm font-semibold text-slate-950">
                      {notification.title}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {notification.message}
                    </p>
                  </div>
                  <div className="shrink-0 text-xs text-slate-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
