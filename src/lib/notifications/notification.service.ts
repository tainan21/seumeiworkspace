"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  persistent?: boolean; // Não desaparece automaticamente
}

interface NotificationStore {
  notifications: Notification[];
  add: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  remove: (id: string) => void;
  clear: () => void;
  unreadCount: number;
}

/**
 * Store para gerenciar notificações
 */
export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],

      add: (notification) => {
        const id = crypto.randomUUID();
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: new Date(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Limitar a 50
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      remove: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clear: () => {
        set({ notifications: [] });
      },

      get unreadCount() {
        return get().notifications.filter((n) => !n.read).length;
      },
    }),
    {
      name: "notification-store",
      partialize: (state) => ({
        notifications: state.notifications,
      }),
    }
  )
);
