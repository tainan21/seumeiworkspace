/**
 * Componentes lazy-loaded para reduzir bundle inicial
 * Componentes compatíveis com Server Components (ssr: true)
 */

import dynamic from "next/dynamic";

/**
 * WorkspaceHeader lazy-loaded
 */
export const LazyWorkspaceHeader = dynamic(
  () => import("~/components/layout/workspace-header").then((mod) => ({ default: mod.WorkspaceHeader })),
  {
    loading: () => <div className="h-16 bg-background border-b" />,
    ssr: true,
  }
);

/**
 * WorkspaceSidebar lazy-loaded
 */
export const LazyWorkspaceSidebar = dynamic(
  () => import("~/components/layout/workspace-sidebar").then((mod) => ({ default: mod.WorkspaceSidebar })),
  {
    loading: () => <div className="w-64 bg-muted/40 border-r" />,
    ssr: true,
  }
);
