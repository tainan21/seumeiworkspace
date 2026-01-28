"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import type { WorkspaceLayoutContract, ThemeStyle, BrandColors } from "~/types/workspace";

// Theme styles - mesmo do layout
const THEME_STYLES: Record<
  ThemeStyle,
  {
    bg: string;
    sidebar: string;
    card: string;
    border: string;
    text: string;
    muted: string;
  }
> = {
  minimal: {
    bg: "bg-zinc-50",
    sidebar: "bg-white",
    card: "bg-white",
    border: "border-zinc-200",
    text: "text-zinc-900",
    muted: "text-zinc-500",
  },
  corporate: {
    bg: "bg-slate-900",
    sidebar: "bg-slate-800",
    card: "bg-slate-800",
    border: "border-slate-700",
    text: "text-slate-50",
    muted: "text-slate-400",
  },
  playful: {
    bg: "bg-fuchsia-50",
    sidebar: "bg-white",
    card: "bg-white",
    border: "border-fuchsia-200",
    text: "text-zinc-900",
    muted: "text-fuchsia-600",
  },
};

export interface WorkspaceLayoutContextValue {
  workspace: WorkspaceLayoutContract | null;
  theme: {
    bg: string;
    sidebar: string;
    card: string;
    border: string;
    text: string;
    muted: string;
  };
  colors: BrandColors;
  isLoading: boolean;
}

const WorkspaceLayoutContext = createContext<WorkspaceLayoutContextValue | null>(null);

/**
 * Provider para contexto do layout do workspace
 * Lê localStorage["seumei-workspace"] e fornece dados de layout
 */
export function WorkspaceLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [workspace, setWorkspace] = useState<WorkspaceLayoutContract | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("seumei-workspace");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Validar que tem os campos mínimos do contrato
        if (
          parsed.workspaceId &&
          parsed.slug &&
          parsed.name &&
          parsed.theme &&
          parsed.brand?.colors &&
          parsed.menuItems &&
          parsed.topBarVariant &&
          parsed.apps
        ) {
          // Extrair apenas campos do contrato (ignorar dados de domínio)
          const layoutContract: WorkspaceLayoutContract = {
            workspaceId: parsed.workspaceId,
            slug: parsed.slug,
            name: parsed.name,
            theme: parsed.theme,
            brand: {
              colors: parsed.brand.colors,
              logo: parsed.brand.logo,
            },
            menuItems: parsed.menuItems,
            topBarVariant: parsed.topBarVariant,
            apps: parsed.apps,
          };
          setWorkspace(layoutContract);
        }
      } catch (error) {
        console.error("[WorkspaceLayoutProvider] Erro ao parsear workspace:", error);
      }
    }
    setIsLoading(false);
  }, []);

  const theme = useMemo(() => {
    if (!workspace) {
      return THEME_STYLES.minimal; // Default
    }
    return THEME_STYLES[workspace.theme] || THEME_STYLES.minimal;
  }, [workspace]);

  const colors = useMemo(() => {
    return workspace?.brand.colors || { primary: "#18181B", accent: "#3B82F6" };
  }, [workspace]);

  const value: WorkspaceLayoutContextValue = {
    workspace,
    theme,
    colors,
    isLoading,
  };

  return (
    <WorkspaceLayoutContext.Provider value={value}>
      {children}
    </WorkspaceLayoutContext.Provider>
  );
}

/**
 * Hook para acessar contexto do layout do workspace em Client Components
 * 
 * @returns WorkspaceLayoutContextValue com workspace, theme e colors
 * @throws Error se usado fora do WorkspaceLayoutProvider
 * 
 * @example
 * ```tsx
 * const { workspace, theme, colors } = useWorkspaceLayout();
 * ```
 */
export function useWorkspaceLayout(): WorkspaceLayoutContextValue {
  const context = useContext(WorkspaceLayoutContext);

  if (!context) {
    throw new Error(
      "useWorkspaceLayout must be used within a WorkspaceLayoutProvider. " +
      "Make sure to wrap your component with WorkspaceLayoutProvider."
    );
  }

  return context;
}
