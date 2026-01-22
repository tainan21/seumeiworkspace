import type { MenuComponent, TopBarVariant } from "@/types/workspace"

// Itens de sistema que sempre aparecem no menu (whitelist)
export const SYSTEM_MENU_ITEMS = ["dashboard", "settings"]

export const DEFAULT_MENU_COMPONENTS: MenuComponent[] = [
  { id: "dashboard", type: "item", label: "Dashboard", icon: "LayoutDashboard" },
  { id: "projects", type: "item", label: "Projetos", icon: "FolderKanban" },
  { id: "docs", type: "item", label: "Documentos", icon: "FileText" },
  { id: "people", type: "item", label: "Pessoas", icon: "Users" },
  { id: "finances", type: "item", label: "Financeiro", icon: "DollarSign" },
  { id: "clients", type: "item", label: "Clientes", icon: "Building2" },
  { id: "calendar", type: "item", label: "Agenda", icon: "Calendar" },
  { id: "analytics", type: "item", label: "Analytics", icon: "BarChart3" },
  { id: "reports", type: "item", label: "Relatórios", icon: "FileBarChart" },
  { id: "integrations", type: "item", label: "Integrações", icon: "Puzzle" },
  { id: "roadmap", type: "item", label: "Roadmap", icon: "Map" },
  { id: "settings", type: "item", label: "Configurações", icon: "Settings" },
]

export interface TopBarConfig {
  variant: TopBarVariant
  name: string
  description: string
  showSearch: boolean
  showNotifications: boolean
  showUserMenu: boolean
  layout: "centered" | "left-aligned" | "split"
}

export const TOPBAR_VARIANTS: TopBarConfig[] = [
  {
    variant: "barTop-A",
    name: "Clássico",
    description: "Logo à esquerda, busca central, ações à direita",
    showSearch: true,
    showNotifications: true,
    showUserMenu: true,
    layout: "split",
  },
  {
    variant: "barTop-B",
    name: "Minimal",
    description: "Logo pequeno, busca expandível, menu compacto",
    showSearch: true,
    showNotifications: true,
    showUserMenu: true,
    layout: "left-aligned",
  },
  {
    variant: "barTop-C",
    name: "Corporativo",
    description: "Logo proeminente, navegação em abas, dropdown de usuário",
    showSearch: true,
    showNotifications: true,
    showUserMenu: true,
    layout: "centered",
  },
]

export function getTopBarConfig(variant: TopBarVariant): TopBarConfig {
  return TOPBAR_VARIANTS.find((t) => t.variant === variant) || TOPBAR_VARIANTS[0]
}
