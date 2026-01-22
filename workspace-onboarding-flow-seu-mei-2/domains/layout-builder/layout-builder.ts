// ============================================
// DOMAIN: Layout Builder
// Logica de negocio para configuracao de layout
// ============================================

import type {
  LayoutConfig,
  SidebarConfig,
  TopBarConfig,
  DashboardConfig,
  FooterConfig,
  VisualStyleConfig,
  LayoutPreset,
  LayoutValidationResult,
  LayoutValidationError,
  LayoutOperationResult,
  SidebarVariant,
  DashboardLayoutType,
  LayoutDensity,
  BorderStyle,
  WidgetDefinition,
  WidgetType,
} from "./layout-builder.types"

// ============================================
// DEFAULT CONFIGURATIONS
// ============================================

export const DEFAULT_SIDEBAR_CONFIG: SidebarConfig = {
  variant: "standard",
  position: "left",
  width: 240,
  collapsedWidth: 64,
  isCollapsible: true,
  isCollapsed: false,
  showHeader: true,
  showFooter: true,
  showDividers: true,
  stickyHeader: true,
}

export const DEFAULT_TOPBAR_CONFIG: TopBarConfig = {
  variant: "barTop-A",
  height: 56,
  isVisible: true,
  isSticky: true,
  showSearch: true,
  showNotifications: true,
  showUserMenu: true,
  showBreadcrumb: false,
  showLogo: true,
}

export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  layoutType: "grid",
  columns: 12,
  gap: 16,
  padding: 24,
  maxWidth: null,
}

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  isVisible: false,
  height: 48,
  isSticky: false,
  showVersion: true,
  showCopyright: true,
  customContent: null,
}

export const DEFAULT_VISUAL_STYLE: VisualStyleConfig = {
  density: "comfortable",
  borderStyle: "rounded",
  shadowIntensity: "subtle",
  animationLevel: "subtle",
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  name: "Layout Padrao",
  sidebar: DEFAULT_SIDEBAR_CONFIG,
  topBar: DEFAULT_TOPBAR_CONFIG,
  dashboard: DEFAULT_DASHBOARD_CONFIG,
  footer: DEFAULT_FOOTER_CONFIG,
  visualStyle: DEFAULT_VISUAL_STYLE,
  isPreset: false,
  isActive: true,
}

// ============================================
// SIDEBAR VARIANT OPTIONS
// ============================================

export interface SidebarVariantOption {
  id: SidebarVariant
  label: string
  description: string
  icon: string
  previewWidth: number
}

export const SIDEBAR_VARIANT_OPTIONS: SidebarVariantOption[] = [
  {
    id: "standard",
    label: "Padrao",
    description: "Sidebar completa com icones e texto",
    icon: "Columns",
    previewWidth: 20,
  },
  {
    id: "compact",
    label: "Compacta",
    description: "Sidebar reduzida com icones maiores",
    icon: "Rows",
    previewWidth: 16,
  },
  {
    id: "mini",
    label: "Mini",
    description: "Apenas icones, expande no hover",
    icon: "Menu",
    previewWidth: 12,
  },
  {
    id: "floating",
    label: "Flutuante",
    description: "Sidebar sobre o conteudo",
    icon: "Layers",
    previewWidth: 20,
  },
  {
    id: "dual",
    label: "Dupla",
    description: "Sidebar dupla (nav + sub-nav)",
    icon: "LayoutList",
    previewWidth: 28,
  },
  {
    id: "hidden",
    label: "Oculta",
    description: "Sem sidebar, apenas topbar",
    icon: "PanelTopClose",
    previewWidth: 0,
  },
]

// ============================================
// DASHBOARD LAYOUT OPTIONS
// ============================================

export interface DashboardLayoutOption {
  id: DashboardLayoutType
  label: string
  description: string
  icon: string
}

export const DASHBOARD_LAYOUT_OPTIONS: DashboardLayoutOption[] = [
  {
    id: "grid",
    label: "Grid",
    description: "Layout em grade flexivel",
    icon: "LayoutGrid",
  },
  {
    id: "masonry",
    label: "Masonry",
    description: "Cards de alturas variadas",
    icon: "Grid3X3",
  },
  {
    id: "list",
    label: "Lista",
    description: "Itens em coluna unica",
    icon: "List",
  },
  {
    id: "kanban",
    label: "Kanban",
    description: "Colunas arrastaveis",
    icon: "Columns",
  },
  {
    id: "split",
    label: "Dividido",
    description: "Paineis lado a lado",
    icon: "PanelLeftClose",
  },
  {
    id: "bento",
    label: "Bento",
    description: "Layout estilo bento box",
    icon: "LayoutDashboard",
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "Layout de timeline vertical",
    icon: "GitBranch",
  },
  {
    id: "calendar",
    label: "Calendario",
    description: "Layout focado em datas",
    icon: "Calendar",
  },
  {
    id: "table-focus",
    label: "Tabelas",
    description: "Foco em dados tabulares",
    icon: "Table",
  },
]

// ============================================
// WIDGET DEFINITIONS
// ============================================

export const AVAILABLE_WIDGETS: WidgetDefinition[] = [
  {
    id: "stats-card",
    type: "stats-card",
    title: "Card de Estatisticas",
    description: "Exibe metricas principais",
    icon: "BarChart2",
    defaultSize: { columns: 3, rows: 2 },
    minSize: { columns: 2, rows: 1 },
    maxSize: { columns: 6, rows: 3 },
    isResizable: true,
    isDraggable: true,
  },
  {
    id: "chart-line",
    type: "chart-line",
    title: "Grafico de Linha",
    description: "Visualiza tendencias ao longo do tempo",
    icon: "TrendingUp",
    defaultSize: { columns: 6, rows: 4 },
    minSize: { columns: 4, rows: 3 },
    maxSize: { columns: 12, rows: 6 },
    isResizable: true,
    isDraggable: true,
  },
  {
    id: "chart-bar",
    type: "chart-bar",
    title: "Grafico de Barras",
    description: "Compara valores entre categorias",
    icon: "BarChart3",
    defaultSize: { columns: 6, rows: 4 },
    minSize: { columns: 4, rows: 3 },
    maxSize: { columns: 12, rows: 6 },
    isResizable: true,
    isDraggable: true,
  },
  {
    id: "chart-pie",
    type: "chart-pie",
    title: "Grafico de Pizza",
    description: "Mostra distribuicao percentual",
    icon: "PieChart",
    defaultSize: { columns: 4, rows: 4 },
    minSize: { columns: 3, rows: 3 },
    maxSize: { columns: 6, rows: 6 },
    isResizable: true,
    isDraggable: true,
  },
  {
    id: "table",
    type: "table",
    title: "Tabela de Dados",
    description: "Exibe dados em formato tabular",
    icon: "Table",
    defaultSize: { columns: 12, rows: 6 },
    minSize: { columns: 6, rows: 4 },
    maxSize: { columns: 12, rows: 12 },
    isResizable: true,
    isDraggable: true,
  },
  {
    id: "activity-feed",
    type: "activity-feed",
    title: "Feed de Atividades",
    description: "Lista ultimas acoes no sistema",
    icon: "Activity",
    defaultSize: { columns: 4, rows: 6 },
    minSize: { columns: 3, rows: 4 },
    maxSize: { columns: 6, rows: 12 },
    isResizable: true,
    isDraggable: true,
  },
  {
    id: "quick-actions",
    type: "quick-actions",
    title: "Acoes Rapidas",
    description: "Atalhos para funcoes frequentes",
    icon: "Zap",
    defaultSize: { columns: 3, rows: 2 },
    minSize: { columns: 2, rows: 2 },
    maxSize: { columns: 6, rows: 4 },
    isResizable: true,
    isDraggable: true,
  },
  {
    id: "calendar",
    type: "calendar",
    title: "Mini Calendario",
    description: "Visualiza eventos e datas",
    icon: "Calendar",
    defaultSize: { columns: 4, rows: 4 },
    minSize: { columns: 3, rows: 3 },
    maxSize: { columns: 6, rows: 6 },
    isResizable: true,
    isDraggable: true,
  },
]

// ============================================
// LAYOUT PRESETS
// ============================================

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: "preset-minimal",
    name: "Minimalista",
    description: "Layout clean e focado no essencial",
    category: "minimal",
    config: {
      sidebar: {
        ...DEFAULT_SIDEBAR_CONFIG,
        variant: "mini",
        width: 64,
      },
      topBar: {
        ...DEFAULT_TOPBAR_CONFIG,
        showBreadcrumb: false,
      },
      dashboard: {
        ...DEFAULT_DASHBOARD_CONFIG,
        layoutType: "grid",
        gap: 24,
        padding: 32,
      },
      footer: {
        ...DEFAULT_FOOTER_CONFIG,
        isVisible: false,
      },
      visualStyle: {
        density: "spacious",
        borderStyle: "rounded",
        shadowIntensity: "subtle",
        animationLevel: "subtle",
      },
    },
  },
  {
    id: "preset-professional",
    name: "Profissional",
    description: "Layout corporativo com todas as funcionalidades",
    category: "professional",
    config: {
      sidebar: {
        ...DEFAULT_SIDEBAR_CONFIG,
        variant: "standard",
        width: 260,
      },
      topBar: {
        ...DEFAULT_TOPBAR_CONFIG,
        showBreadcrumb: true,
        height: 64,
      },
      dashboard: {
        ...DEFAULT_DASHBOARD_CONFIG,
        layoutType: "grid",
        columns: 12,
        gap: 16,
      },
      footer: {
        ...DEFAULT_FOOTER_CONFIG,
        isVisible: true,
        showVersion: true,
      },
      visualStyle: {
        density: "comfortable",
        borderStyle: "rounded",
        shadowIntensity: "medium",
        animationLevel: "subtle",
      },
    },
  },
  {
    id: "preset-compact",
    name: "Compacto",
    description: "Maximiza o espaco de conteudo",
    category: "data-heavy",
    config: {
      sidebar: {
        ...DEFAULT_SIDEBAR_CONFIG,
        variant: "compact",
        width: 180,
      },
      topBar: {
        ...DEFAULT_TOPBAR_CONFIG,
        height: 48,
        showBreadcrumb: false,
      },
      dashboard: {
        ...DEFAULT_DASHBOARD_CONFIG,
        layoutType: "table-focus",
        gap: 8,
        padding: 16,
      },
      footer: {
        ...DEFAULT_FOOTER_CONFIG,
        isVisible: false,
      },
      visualStyle: {
        density: "compact",
        borderStyle: "sharp",
        shadowIntensity: "none",
        animationLevel: "none",
      },
    },
  },
  {
    id: "preset-creative",
    name: "Criativo",
    description: "Layout dinamico com visual moderno",
    category: "creative",
    config: {
      sidebar: {
        ...DEFAULT_SIDEBAR_CONFIG,
        variant: "floating",
        width: 280,
      },
      topBar: {
        ...DEFAULT_TOPBAR_CONFIG,
        variant: "barTop-B",
        height: 60,
      },
      dashboard: {
        ...DEFAULT_DASHBOARD_CONFIG,
        layoutType: "bento",
        gap: 20,
        padding: 28,
      },
      footer: {
        ...DEFAULT_FOOTER_CONFIG,
        isVisible: false,
      },
      visualStyle: {
        density: "comfortable",
        borderStyle: "pill",
        shadowIntensity: "strong",
        animationLevel: "full",
      },
    },
  },
  {
    id: "preset-kanban",
    name: "Kanban",
    description: "Otimizado para gestao de projetos",
    category: "professional",
    config: {
      sidebar: {
        ...DEFAULT_SIDEBAR_CONFIG,
        variant: "compact",
        width: 200,
      },
      topBar: {
        ...DEFAULT_TOPBAR_CONFIG,
        showBreadcrumb: true,
      },
      dashboard: {
        ...DEFAULT_DASHBOARD_CONFIG,
        layoutType: "kanban",
        gap: 12,
        padding: 20,
      },
      footer: {
        ...DEFAULT_FOOTER_CONFIG,
        isVisible: false,
      },
      visualStyle: {
        density: "comfortable",
        borderStyle: "rounded",
        shadowIntensity: "subtle",
        animationLevel: "full",
      },
    },
  },
]

// ============================================
// FACTORY FUNCTIONS
// ============================================

/**
 * Cria uma configuracao de layout com valores padrao
 */
export function createLayoutConfig(
  overrides?: Partial<LayoutConfig>
): LayoutConfig {
  return {
    ...DEFAULT_LAYOUT_CONFIG,
    ...overrides,
    sidebar: { ...DEFAULT_SIDEBAR_CONFIG, ...overrides?.sidebar },
    topBar: { ...DEFAULT_TOPBAR_CONFIG, ...overrides?.topBar },
    dashboard: { ...DEFAULT_DASHBOARD_CONFIG, ...overrides?.dashboard },
    footer: { ...DEFAULT_FOOTER_CONFIG, ...overrides?.footer },
    visualStyle: { ...DEFAULT_VISUAL_STYLE, ...overrides?.visualStyle },
  }
}

/**
 * Aplica um preset a uma configuracao existente
 */
export function applyPreset(
  currentConfig: LayoutConfig,
  presetId: string
): LayoutConfig {
  const preset = LAYOUT_PRESETS.find((p) => p.id === presetId)
  if (!preset) return currentConfig

  return {
    ...currentConfig,
    ...preset.config,
    name: currentConfig.name,
    id: currentConfig.id,
    workspaceId: currentConfig.workspaceId,
  }
}

/**
 * Obtem preset por ID
 */
export function getPresetById(presetId: string): LayoutPreset | undefined {
  return LAYOUT_PRESETS.find((p) => p.id === presetId)
}

// ============================================
// VALIDATION
// ============================================

/**
 * Valida configuracao de sidebar
 */
function validateSidebarConfig(config: SidebarConfig): LayoutValidationError[] {
  const errors: LayoutValidationError[] = []

  if (config.width < 48 || config.width > 400) {
    errors.push({
      field: "sidebar.width",
      message: "Largura deve estar entre 48 e 400 pixels",
      code: "INVALID_RANGE",
    })
  }

  if (config.collapsedWidth < 40 || config.collapsedWidth > config.width) {
    errors.push({
      field: "sidebar.collapsedWidth",
      message: "Largura colapsada invalida",
      code: "INVALID_RANGE",
    })
  }

  return errors
}

/**
 * Valida configuracao de topbar
 */
function validateTopBarConfig(config: TopBarConfig): LayoutValidationError[] {
  const errors: LayoutValidationError[] = []

  if (config.height < 40 || config.height > 100) {
    errors.push({
      field: "topBar.height",
      message: "Altura deve estar entre 40 e 100 pixels",
      code: "INVALID_RANGE",
    })
  }

  return errors
}

/**
 * Valida configuracao de dashboard
 */
function validateDashboardConfig(
  config: DashboardConfig
): LayoutValidationError[] {
  const errors: LayoutValidationError[] = []

  if (config.columns < 1 || config.columns > 24) {
    errors.push({
      field: "dashboard.columns",
      message: "Colunas devem estar entre 1 e 24",
      code: "INVALID_RANGE",
    })
  }

  if (config.gap < 0 || config.gap > 64) {
    errors.push({
      field: "dashboard.gap",
      message: "Espacamento deve estar entre 0 e 64 pixels",
      code: "INVALID_RANGE",
    })
  }

  if (config.padding < 0 || config.padding > 64) {
    errors.push({
      field: "dashboard.padding",
      message: "Padding deve estar entre 0 e 64 pixels",
      code: "INVALID_RANGE",
    })
  }

  return errors
}

/**
 * Valida configuracao completa de layout
 */
export function validateLayoutConfig(
  config: LayoutConfig
): LayoutValidationResult {
  const errors: LayoutValidationError[] = []
  const warnings: LayoutValidationError[] = []

  // Validar nome
  if (!config.name || config.name.trim().length === 0) {
    errors.push({
      field: "name",
      message: "Nome e obrigatorio",
      code: "REQUIRED",
    })
  }

  // Validar componentes
  errors.push(...validateSidebarConfig(config.sidebar))
  errors.push(...validateTopBarConfig(config.topBar))
  errors.push(...validateDashboardConfig(config.dashboard))

  // Warnings
  if (config.sidebar.variant === "hidden" && !config.topBar.isVisible) {
    warnings.push({
      field: "layout",
      message: "Sem sidebar e sem topbar, navegacao pode ser dificil",
      code: "UX_CONCERN",
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

// ============================================
// SERIALIZATION
// ============================================

/**
 * Serializa config para salvar no banco
 */
export function serializeLayoutConfig(config: LayoutConfig): string {
  return JSON.stringify(config)
}

/**
 * Deserializa config do banco
 */
export function deserializeLayoutConfig(json: string): LayoutConfig {
  try {
    const parsed = JSON.parse(json)
    // Merge com defaults para garantir todos os campos
    return createLayoutConfig(parsed)
  } catch {
    return DEFAULT_LAYOUT_CONFIG
  }
}

// ============================================
// UTILITIES
// ============================================

/**
 * Calcula largura efetiva da sidebar baseado no estado
 */
export function getEffectiveSidebarWidth(config: SidebarConfig): number {
  if (config.variant === "hidden") return 0
  if (config.isCollapsed) return config.collapsedWidth
  if (config.variant === "mini") return config.collapsedWidth
  return config.width
}

/**
 * Calcula altura efetiva da topbar
 */
export function getEffectiveTopBarHeight(config: TopBarConfig): number {
  return config.isVisible ? config.height : 0
}

/**
 * Gera CSS custom properties para o layout
 */
export function generateLayoutCSSVariables(config: LayoutConfig): Record<string, string> {
  return {
    "--layout-sidebar-width": `${getEffectiveSidebarWidth(config.sidebar)}px`,
    "--layout-sidebar-collapsed-width": `${config.sidebar.collapsedWidth}px`,
    "--layout-topbar-height": `${getEffectiveTopBarHeight(config.topBar)}px`,
    "--layout-footer-height": config.footer.isVisible ? `${config.footer.height}px` : "0px",
    "--layout-content-padding": `${config.dashboard.padding}px`,
    "--layout-grid-gap": `${config.dashboard.gap}px`,
    "--layout-grid-columns": `${config.dashboard.columns}`,
  }
}
