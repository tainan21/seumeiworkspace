"use client";

/**
 * Componentes lazy-loaded para Client Components
 * Componentes que requerem ssr: false devem ser importados apenas em Client Components
 */

import dynamic from "next/dynamic";

/**
 * NotificationCenter lazy-loaded
 * Apenas para uso em Client Components
 */
export const LazyNotificationCenter = dynamic(
  () => import("~/components/notifications/notification-center").then((mod) => ({ default: mod.NotificationCenter })),
  {
    loading: () => null,
    ssr: false,
  }
);

/**
 * AppsMarketplace lazy-loaded
 * Apenas para uso em Client Components
 */
export const LazyAppsMarketplace = dynamic(
  () => import("~/components/apps/apps-marketplace").then((mod) => ({ default: mod.AppsMarketplace })),
  {
    loading: () => <div className="h-64" />,
    ssr: false,
  }
);
