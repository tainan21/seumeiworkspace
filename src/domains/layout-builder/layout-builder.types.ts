// ============================================
// DOMAIN: Layout Builder Types
// Tipos para configuracao avancada de layout
// ============================================

import type { BrandColors, TopBarVariant, MenuComponent } from "@/types/workspace"

// ============================================
// SIDEBAR CONFIGURATION
// ============================================

/**
 * Variantes de sidebar disponiveis
 */
export type SidebarVariant =
  | "standard" // Sidebar completa com icones e texto
  | "compact" // Sidebar reduzida com icones maiores
  | "mini" // Apenas icones, expande no hover
  | "floating" // Sidebar sobre o conteudo
  | "dual" // Sidebar dupla (nav + sub-nav)
  | "hidden" // Sem sidebar (apenas topbar)

/**
 * Posicao da sidebar
 */
export type SidebarPosition = "left" | "right"

/**
 * Configuracao completa da sidebar
 */
export interface SidebarConfig {
  variant: SidebarVariant
  position: SidebarPosition
  width: number // em pixels
  collapsedWidth: number // largura quando colapsada
  isCollapsible: boolean
  isCollapsed: boolean
  showHeader: boolean // mostrar logo/nome no topo
  showFooter: boolean // mostrar area inferior (settings, user)
  showDividers: boolean // mostrar divisores entre grupos
  stickyHeader: boolean // header fixo no scroll
}

// ============================================
// TOPBAR CONFIGURATION
// ============================================

/**
 * Configuracao completa da topbar
 */
export interface TopBarConfig {
  variant: TopBarVariant
  height: number // em pixels
  isVisible: boolean
  isSticky: boolean
  showSearch: boolean
  showNotifications: boolean
  showUserMenu: boolean
  showBreadcrumb: boolean
  showLogo: boolean
}

// ============================================
// DASHBOARD LAYOUT
// ============================================

/**
 * Tipos de layout do dashboard
 */
export type DashboardLayoutType =
  | "grid" // Grid flexivel com colunas
  | "masonry" // Cards de alturas variadas
  | "list" // Itens em coluna unica
  | "kanban" // Colunas arrastaveis
  | "split" // Paineis lado a lado
  | "bento" // Layout estilo bento box
  | "timeline" // Layout de timeline vertical
  | "calendar" // Layout de calendario
  | "table-focus" // Foco em tabelas/dados

/**
 * Configuracao do dashboard
 */
export interface DashboardConfig {
  layoutType: DashboardLayoutType
  columns: number // numero de colunas do grid
  gap: number // espacamento em pixels
  padding: number // padding do conteudo
  maxWidth: number | null // largura maxima (null = full width)
}

// ============================================
// FOOTER CONFIGURATION
// ============================================

/**
 * Configuracao do footer
 */
export interface FooterConfig {
  isVisible: boolean
  height: number
  isSticky: boolean
  showVersion: boolean
  showCopyright: boolean
  customContent: string | null
}

// ============================================
// WIDGET SYSTEM
// ============================================

/**
 * Tipos de widgets disponiveis
 */
export type WidgetType =
  | "stats-card" // Card de estatisticas
  | "chart-line" // Grafico de linha
  | "chart-bar" // Grafico de barras
  | "chart-pie" // Grafico de pizza
  | "table" // Tabela de dados
  | "list" // Lista simples
  | "calendar" // Mini calendario
  | "activity-feed" // Feed de atividades
  | "quick-actions" // Acoes rapidas
  | "search" // Barra de busca
  | "notifications" // Lista de notificacoes
  | "user-profile" // Card de perfil
  | "custom" // Widget customizado

/**
 * Definicao de widget
 */
export interface WidgetDefinition {
  id: string
  type: WidgetType
  title: string
  description?: string
  icon?: string
  defaultSize: {
    columns: number
    rows: number
  }
  minSize?: {
    columns: number
    rows: number
  }
  maxSize?: {
    columns: number
    rows: number
  }
  isResizable: boolean
  isDraggable: boolean
}

/**
 * Instancia de widget no grid
 */
export interface WidgetInstance {
  id: string
  widgetId: string // referencia ao WidgetDefinition
  position: {
    column: number
    row: number
  }
  size: {
    columns: number
    rows: number
  }
  config?: Record<string, unknown> // configuracoes especificas do widget
}

/**
 * Grid de widgets
 */
export interface WidgetGrid {
  columns: number
  rows: number
  widgets: WidgetInstance[]
}

// ============================================
// DENSITY & STYLING
// ============================================

/**
 * Densidade do layout
 */
export type LayoutDensity = "compact" | "comfortable" | "spacious"

/**
 * Estilo de bordas
 */
export type BorderStyle = "sharp" | "rounded" | "pill"

/**
 * Configuracao de estilo visual
 */
export interface VisualStyleConfig {
  density: LayoutDensity
  borderStyle: BorderStyle
  shadowIntensity: "none" | "subtle" | "medium" | "strong"
  animationLevel: "none" | "subtle" | "full"
}

// ============================================
// COMPLETE LAYOUT CONFIG
// ============================================

/**
 * Configuracao completa de layout
 */
export interface LayoutConfig {
  id?: string
  workspaceId?: string
  name: string
  description?: string

  // Componentes principais
  sidebar: SidebarConfig
  topBar: TopBarConfig
  dashboard: DashboardConfig
  footer: FooterConfig

  // Estilo visual
  visualStyle: VisualStyleConfig

  // Widgets (opcional)
  widgetGrid?: WidgetGrid

  // Metadata
  isPreset: boolean
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

// ============================================
// PRESETS
// ============================================

/**
 * Preset de layout pre-definido
 */
export interface LayoutPreset {
  id: string
  name: string
  description: string
  thumbnail?: string
  category: "minimal" | "professional" | "creative" | "data-heavy"
  config: Omit<LayoutConfig, "id" | "workspaceId" | "name" | "isPreset" | "isActive" | "createdAt" | "updatedAt">
}

// ============================================
// DATABASE SCHEMA
// ============================================

/**
 * Schema do banco para layouts
 */
export interface DBWorkspaceLayout {
  id: string // UUID, PK
  workspace_id: string // FK workspaces(id)
  name: string
  description: string | null
  config: LayoutConfig // JSONB
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DBLayoutPreset {
  id: string // UUID, PK
  name: string
  description: string | null
  config: LayoutConfig // JSONB
  category: string
  is_system: boolean
  created_at: string
}

// ============================================
// VALIDATION
// ============================================

export interface LayoutValidationError {
  field: string
  message: string
  code: string
}

export interface LayoutValidationResult {
  valid: boolean
  errors: LayoutValidationError[]
  warnings: LayoutValidationError[]
}

// ============================================
// OPERATION RESULTS
// ============================================

export type LayoutOperationResult =
  | { success: true; layout: LayoutConfig }
  | { success: false; errors: LayoutValidationError[] }
