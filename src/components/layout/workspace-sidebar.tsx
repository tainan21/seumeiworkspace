"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspace } from "~/lib/hooks/useWorkspace";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  Settings,
  Building2,
  Package,
} from "lucide-react";
import { cn } from "~/lib/utils";

interface WorkspaceSidebarProps {
  workspaceId: string;
}

/**
 * Mapeamento de features para itens de menu
 * Este mapeamento será expandido conforme features são adicionadas
 */
const FEATURE_MENU_ITEMS: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; route: string }
> = {
  dashboard: {
    label: "Dashboard",
    icon: LayoutDashboard,
    route: "/dashboard",
  },
  projects: {
    label: "Projetos",
    icon: FolderKanban,
    route: "/projects",
  },
  docs: {
    label: "Documentos",
    icon: FileText,
    route: "/docs",
  },
  people: {
    label: "Pessoas",
    icon: Users,
    route: "/people",
  },
  finances: {
    label: "Financeiro",
    icon: DollarSign,
    route: "/finances",
  },
  calendar: {
    label: "Agenda",
    icon: Calendar,
    route: "/calendar",
  },
  analytics: {
    label: "Analytics",
    icon: BarChart3,
    route: "/analytics",
  },
  apps: {
    label: "Apps",
    icon: Package,
    route: "/apps",
  },
};

/**
 * Itens de menu sempre disponíveis (não dependem de features)
 */
const SYSTEM_MENU_ITEMS = [
  {
    id: "settings",
    label: "Configurações",
    icon: Settings,
    route: "/settings",
  },
];

/**
 * Sidebar do workspace
 * Menu de navegação dinâmico baseado em features ativas
 */
export function WorkspaceSidebar({ workspaceId }: WorkspaceSidebarProps) {
  const { workspaceSlug } = useWorkspace();
  const pathname = usePathname();

  // TODO: Buscar features ativas do workspace
  // Por enquanto, exibimos um menu básico
  // Quando o sistema de features estiver implementado, buscar via API
  const activeFeatures = ["dashboard", "projects"]; // Mock por enquanto

  // Montar itens de menu baseado em features ativas
  const menuItems = [
    ...activeFeatures.map((feature) => {
      const item = FEATURE_MENU_ITEMS[feature];
      if (!item) return null;
      return {
        id: feature,
        ...item,
      };
    }),
    ...SYSTEM_MENU_ITEMS,
  ].filter(Boolean) as Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    route: string;
  }>;

  const isActive = (route: string) => {
    const fullRoute = `/${workspaceSlug}${route}`;
    return pathname === fullRoute || pathname.startsWith(`${fullRoute}/`);
  };

  return (
    <aside className="bg-muted/40 hidden w-64 border-r lg:block">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const fullRoute = `/${workspaceSlug}${item.route}`;
          const active = isActive(item.route);

          return (
            <Link
              key={item.id}
              href={fullRoute}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
