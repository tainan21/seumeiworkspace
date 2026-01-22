"use client";

import { useNotificationStore } from "~/lib/notifications/notification.service";
import { toast } from "~/hooks/use-toast";
import type { NotificationType } from "~/lib/notifications/notification.service";

/**
 * Hook para gerenciar notificações
 * Integra com toast e notification center
 */
export function useNotifications() {
  const { add } = useNotificationStore();

  const notify = (
    type: NotificationType,
    title: string,
    message?: string,
    persistent = false
  ) => {
    // Adicionar ao notification center
    add({
      type,
      title,
      message,
      persistent,
    });

    // Mostrar toast também
    toast({
      title,
      description: message,
      variant:
        type === "error"
          ? "destructive"
          : type === "success"
          ? "default"
          : undefined,
    });
  };

  return {
    notify,
    success: (title: string, message?: string) =>
      notify("success", title, message),
    error: (title: string, message?: string) =>
      notify("error", title, message),
    warning: (title: string, message?: string) =>
      notify("warning", title, message),
    info: (title: string, message?: string) => notify("info", title, message),
  };
}
