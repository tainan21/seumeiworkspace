// ============================================
// DOMAIN: Component
// Lógica para arquitetura de componentes modulares
// ============================================

import type {
  SidebarConfig,
  SidebarVariant,
  TopBarConfig,
  DashboardLayoutConfig,
  DashboardLayoutType,
  ChartConfig,
  ChartType,
  WidgetConfig,
  WidgetSize,
  LayoutComposition,
  LayoutPreset,
  ComponentDefinition,
  ComponentRegistry,
  ComponentValidationResult,
} from "./component.types"
import type { TopBarVariant, ThemeStyle, BrandColors } from "@/types/workspace"

// ============================================
// SIDEBAR CONFIGURATION HELPERS
// ============================================

const SIDEBAR_VARIANT_WIDTHS: Record<SidebarVariant, { expanded: number; collapsed: number }> = {
  standard: { expanded: 240, collapsed: 72 },
  compact: { expanded: 200, collapsed: 56 },
  mini: { expanded: 180, collapsed: 48 },
  floating: { expanded: 280, collapsed: 0 },
}

export function createSidebarConfig(variant: SidebarVariant, overrides?: Partial<SidebarConfig>): SidebarConfig {
  const baseConfig: SidebarConfig = {
    variant,
    position: "left",
    behavior: variant === "floating" ? "auto-hide" : "collapsible",
    width: SIDEBAR_VARIANT_WIDTHS[variant],
    showLogo: true,
    showSearch: variant === "standard",
    showUserProfile: variant !== "mini",
    groupNavigation: variant === "standard" || variant === "compact",
    enableTooltips: true,
  }

  return { ...baseConfig, ...overrides }
}

export function getSidebarVariantDescription(variant: SidebarVariant): string {
  const descriptions: Record<SidebarVariant, string> = {
    standard: "Sidebar padrão com navegação completa e grupos",
    compact: "Sidebar compacta com ícones e labels menores",
    mini: "Sidebar mínima apenas com ícones",
    floating: "Sidebar flutuante que aparece ao passar o mouse",
  }
  return descriptions[variant]
}

// ============================================
// TOPBAR CONFIGURATION HELPERS
// ============================================

export function createTopBarConfig(variant: TopBarVariant, overrides?: Partial<TopBarConfig>): TopBarConfig {
  const variantConfigs: Record<TopBarVariant, Partial<TopBarConfig>> = {
    "barTop-A": {
      layout: "split",
      showSearch: true,
      showBreadcrumbs: false,
      showQuickActions: false,
    },
    "barTop-B": {
      layout: "centered",
      showSearch: true,
      showBreadcrumbs: false,
      showQuickActions: false,
    },
    "barTop-C": {
      layout: "left-aligned",
      showSearch: true,
      showBreadcrumbs: true,
      showQuickActions: true,
    },
  }

  const baseConfig: TopBarConfig = {
    variant,
    layout: "split",
    showSearch: true,
    showNotifications: true,
    showUserMenu: true,
    showBreadcrumbs: false,
    showQuickActions: false,
    stickyOnScroll: true,
    height: 56,
    ...variantConfigs[variant],
  }

  return { ...baseConfig, ...overrides }
}

export function getTopBarVariantDescription(variant: TopBarVariant): string {
  const descriptions: Record<TopBarVariant, string> = {
    "barTop-A": "Clássico - Busca à esquerda, ações à direita",
    "barTop-B": "Minimal - Busca centralizada, layout clean",
    "barTop-C": "Corporativo - Navegação em abas, breadcrumbs",
  }
  return descriptions[variant]
}

// ============================================
// DASHBOARD LAYOUT HELPERS
// ============================================

const LAYOUT_TYPE_COLUMNS: Record<DashboardLayoutType, number> = {
  grid: 12,
  masonry: 4,
  list: 1,
  kanban: 4,
  split: 2,
}

export function createDashboardLayout(
  type: DashboardLayoutType,
  overrides?: Partial<DashboardLayoutConfig>,
): DashboardLayoutConfig {
  const baseConfig: DashboardLayoutConfig = {
    type,
    columns: LAYOUT_TYPE_COLUMNS[type],
    gap: type === "list" ? 8 : 16,
    padding: 24,
    widgets: [],
    enableDragDrop: type === "grid" || type === "kanban",
    enableResize: type === "grid",
    responsiveBreakpoints: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  }

  return { ...baseConfig, ...overrides }
}

export function getDashboardLayoutDescription(type: DashboardLayoutType): string {
  const descriptions: Record<DashboardLayoutType, string> = {
    grid: "Layout em grid flexível com widgets redimensionáveis",
    masonry: "Layout masonry com cards de altura variável",
    list: "Lista vertical de cards empilhados",
    kanban: "Colunas estilo Kanban para organização",
    split: "Layout dividido em painéis principais",
  }
  return descriptions[type]
}

// ============================================
// WIDGET HELPERS
// ============================================

const WIDGET_SIZE_SPANS: Record<WidgetSize, { rows: number; cols: number }> = {
  small: { rows: 1, cols: 3 },
  medium: { rows: 1, cols: 6 },
  large: { rows: 2, cols: 6 },
  full: { rows: 2, cols: 12 },
}

export function createWidget(
  id: string,
  type: string,
  title: string,
  size: WidgetSize,
  position: { row: number; col: number },
  config?: Record<string, unknown>,
): WidgetConfig {
  return {
    id,
    type,
    title,
    size,
    position,
    span: WIDGET_SIZE_SPANS[size],
    visible: true,
    config,
  }
}

export function calculateWidgetPosition(
  existingWidgets: WidgetConfig[],
  columns: number,
): { row: number; col: number } {
  if (existingWidgets.length === 0) {
    return { row: 0, col: 0 }
  }

  const occupiedCells = new Set<string>()

  existingWidgets.forEach((widget) => {
    for (let r = widget.position.row; r < widget.position.row + widget.span.rows; r++) {
      for (let c = widget.position.col; c < widget.position.col + widget.span.cols; c++) {
        occupiedCells.add(`${r}-${c}`)
      }
    }
  })

  let row = 0
  let col = 0

  while (occupiedCells.has(`${row}-${col}`)) {
    col++
    if (col >= columns) {
      col = 0
      row++
    }
  }

  return { row, col }
}

// ============================================
// CHART CONFIGURATION HELPERS
// ============================================

export function createChartConfig(
  id: string,
  title: string,
  type: ChartType,
  series: { id: string; name: string; dataKey: string; color?: string }[],
  overrides?: Partial<ChartConfig>,
): ChartConfig {
  return {
    id,
    type,
    title,
    colorScheme: "brand",
    series: series.map((s) => ({ ...s, visible: true })),
    showLegend: series.length > 1,
    showTooltip: true,
    showGrid: type !== "pie" && type !== "donut",
    animate: true,
    responsive: true,
    ...overrides,
  }
}

export function getChartTypeIcon(type: ChartType): string {
  const icons: Record<ChartType, string> = {
    line: "TrendingUp",
    bar: "BarChart3",
    area: "AreaChart",
    pie: "PieChart",
    donut: "Circle",
    scatter: "ScatterChart",
    radar: "Radar",
    gauge: "Gauge",
  }
  return icons[type]
}

export function getChartTypeDescription(type: ChartType): string {
  const descriptions: Record<ChartType, string> = {
    line: "Ideal para mostrar tendências ao longo do tempo",
    bar: "Comparação entre categorias distintas",
    area: "Tendências com ênfase em volume",
    pie: "Proporções de um todo",
    donut: "Proporções com destaque central",
    scatter: "Correlação entre duas variáveis",
    radar: "Comparação multidimensional",
    gauge: "Indicador de progresso ou meta",
  }
  return descriptions[type]
}

// ============================================
// LAYOUT COMPOSITION
// ============================================

export function createLayoutComposition(
  id: string,
  name: string,
  options: {
    sidebar?: Partial<SidebarConfig>
    topbar?: Partial<TopBarConfig>
    dashboard?: Partial<DashboardLayoutConfig>
    theme?: ThemeStyle
    colors?: BrandColors
  },
): LayoutComposition {
  return {
    id,
    name,
    description: "",
    sidebar: createSidebarConfig("standard", options.sidebar),
    topbar: createTopBarConfig("barTop-A", options.topbar),
    dashboard: createDashboardLayout("grid", options.dashboard),
    theme: options.theme || "minimal",
    colors: options.colors || { primary: "#3B82F6", accent: "#10B981" },
  }
}

// ============================================
// LAYOUT PRESETS
// ============================================

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: "preset-minimal",
    name: "Minimal",
    description: "Layout limpo e focado com sidebar colapsável",
    composition: {
      id: "minimal-composition",
      name: "Minimal",
      description: "Layout minimalista",
      sidebar: createSidebarConfig("compact"),
      topbar: createTopBarConfig("barTop-B"),
      dashboard: createDashboardLayout("grid"),
      theme: "minimal",
      colors: { primary: "#18181B", accent: "#3B82F6" },
    },
    targetUseCases: ["startups", "saas", "productivity"],
  },
  {
    id: "preset-corporate",
    name: "Corporativo",
    description: "Layout formal com navegação completa",
    composition: {
      id: "corporate-composition",
      name: "Corporativo",
      description: "Layout corporativo",
      sidebar: createSidebarConfig("standard"),
      topbar: createTopBarConfig("barTop-C"),
      dashboard: createDashboardLayout("grid"),
      theme: "corporate",
      colors: { primary: "#1E40AF", accent: "#059669" },
    },
    targetUseCases: ["enterprise", "finance", "consulting"],
  },
  {
    id: "preset-dashboard",
    name: "Data Dashboard",
    description: "Otimizado para visualização de dados",
    composition: {
      id: "dashboard-composition",
      name: "Data Dashboard",
      description: "Layout para dashboards",
      sidebar: createSidebarConfig("mini"),
      topbar: createTopBarConfig("barTop-A"),
      dashboard: createDashboardLayout("grid", { enableDragDrop: true, enableResize: true }),
      theme: "minimal",
      colors: { primary: "#6366F1", accent: "#F59E0B" },
    },
    targetUseCases: ["analytics", "monitoring", "reporting"],
  },
  {
    id: "preset-kanban",
    name: "Kanban",
    description: "Layout estilo Kanban para gestão de tarefas",
    composition: {
      id: "kanban-composition",
      name: "Kanban",
      description: "Layout Kanban",
      sidebar: createSidebarConfig("compact"),
      topbar: createTopBarConfig("barTop-A"),
      dashboard: createDashboardLayout("kanban"),
      theme: "minimal",
      colors: { primary: "#8B5CF6", accent: "#EC4899" },
    },
    targetUseCases: ["project-management", "agile", "tasks"],
  },
]

export function getPresetById(presetId: string): LayoutPreset | undefined {
  return LAYOUT_PRESETS.find((p) => p.id === presetId)
}

export function getPresetsForUseCase(useCase: string): LayoutPreset[] {
  return LAYOUT_PRESETS.filter((p) => p.targetUseCases.includes(useCase))
}

// ============================================
// COMPONENT REGISTRY
// ============================================

export const COMPONENT_REGISTRY: ComponentRegistry = {
  version: "1.0.0",
  categories: ["layout", "navigation", "data-display", "feedback", "input", "chart"],
  components: [
    {
      id: "sidebar",
      name: "Sidebar",
      category: "navigation",
      description: "Barra lateral de navegação",
      icon: "PanelLeft",
      configSchema: {},
      defaultConfig: { variant: "standard", position: "left" },
      supportedVariants: ["standard", "compact", "mini", "floating"],
    },
    {
      id: "topbar",
      name: "TopBar",
      category: "navigation",
      description: "Barra superior com busca e ações",
      icon: "PanelTop",
      configSchema: {},
      defaultConfig: { variant: "barTop-A" },
      supportedVariants: ["barTop-A", "barTop-B", "barTop-C"],
    },
    {
      id: "chart-line",
      name: "Gráfico de Linha",
      category: "chart",
      description: "Visualização de tendências",
      icon: "TrendingUp",
      configSchema: {},
      defaultConfig: { type: "line" },
      supportedVariants: ["simple", "multi-series", "stacked"],
    },
    {
      id: "chart-bar",
      name: "Gráfico de Barras",
      category: "chart",
      description: "Comparação entre categorias",
      icon: "BarChart3",
      configSchema: {},
      defaultConfig: { type: "bar" },
      supportedVariants: ["vertical", "horizontal", "stacked", "grouped"],
    },
    {
      id: "chart-pie",
      name: "Gráfico de Pizza",
      category: "chart",
      description: "Proporções de um todo",
      icon: "PieChart",
      configSchema: {},
      defaultConfig: { type: "pie" },
      supportedVariants: ["simple", "donut"],
    },
    {
      id: "chart-area",
      name: "Gráfico de Área",
      category: "chart",
      description: "Tendências com volume",
      icon: "AreaChart",
      configSchema: {},
      defaultConfig: { type: "area" },
      supportedVariants: ["simple", "stacked", "gradient"],
    },
    {
      id: "widget-stats",
      name: "Widget de Estatísticas",
      category: "data-display",
      description: "Exibe métricas com indicadores",
      icon: "Hash",
      configSchema: {},
      defaultConfig: { size: "small" },
      supportedVariants: ["simple", "with-trend", "with-chart"],
    },
    {
      id: "widget-table",
      name: "Widget de Tabela",
      category: "data-display",
      description: "Tabela de dados compacta",
      icon: "Table",
      configSchema: {},
      defaultConfig: { size: "medium" },
      supportedVariants: ["simple", "sortable", "paginated"],
    },
  ],
}

export function getComponentsByCategory(category: string): ComponentDefinition[] {
  return COMPONENT_REGISTRY.components.filter((c) => c.category === category)
}

export function getComponentById(componentId: string): ComponentDefinition | undefined {
  return COMPONENT_REGISTRY.components.find((c) => c.id === componentId)
}

// ============================================
// VALIDATION
// ============================================

export function validateLayoutComposition(composition: LayoutComposition): ComponentValidationResult {
  const errors: ComponentValidationResult["errors"] = []

  // Validate sidebar
  if (!composition.sidebar) {
    errors.push({ path: "sidebar", message: "Configuração de sidebar é obrigatória", severity: "error" })
  } else if (composition.sidebar.width.expanded < composition.sidebar.width.collapsed) {
    errors.push({
      path: "sidebar.width",
      message: "Largura expandida deve ser maior que colapsada",
      severity: "error",
    })
  }

  // Validate topbar
  if (!composition.topbar) {
    errors.push({ path: "topbar", message: "Configuração de topbar é obrigatória", severity: "error" })
  } else if (composition.topbar.height < 40) {
    errors.push({
      path: "topbar.height",
      message: "Altura mínima da topbar é 40px",
      severity: "warning",
    })
  }

  // Validate dashboard
  if (!composition.dashboard) {
    errors.push({ path: "dashboard", message: "Configuração de dashboard é obrigatória", severity: "error" })
  } else if (composition.dashboard.columns < 1 || composition.dashboard.columns > 24) {
    errors.push({
      path: "dashboard.columns",
      message: "Número de colunas deve estar entre 1 e 24",
      severity: "error",
    })
  }

  // Validate colors
  if (!composition.colors?.primary) {
    errors.push({ path: "colors.primary", message: "Cor primária é obrigatória", severity: "error" })
  }

  return {
    valid: errors.filter((e) => e.severity === "error").length === 0,
    errors,
  }
}

// ============================================
// CONFIGURATION OPERATIONS (Pure Functions)
// ============================================

export function updateSidebarInComposition(
  composition: LayoutComposition,
  updates: Partial<SidebarConfig>,
): LayoutComposition {
  return {
    ...composition,
    sidebar: { ...composition.sidebar, ...updates },
  }
}

export function updateTopbarInComposition(
  composition: LayoutComposition,
  updates: Partial<TopBarConfig>,
): LayoutComposition {
  return {
    ...composition,
    topbar: { ...composition.topbar, ...updates },
  }
}

export function updateDashboardInComposition(
  composition: LayoutComposition,
  updates: Partial<DashboardLayoutConfig>,
): LayoutComposition {
  return {
    ...composition,
    dashboard: { ...composition.dashboard, ...updates },
  }
}

export function addWidgetToComposition(composition: LayoutComposition, widget: WidgetConfig): LayoutComposition {
  return {
    ...composition,
    dashboard: {
      ...composition.dashboard,
      widgets: [...composition.dashboard.widgets, widget],
    },
  }
}

export function removeWidgetFromComposition(composition: LayoutComposition, widgetId: string): LayoutComposition {
  return {
    ...composition,
    dashboard: {
      ...composition.dashboard,
      widgets: composition.dashboard.widgets.filter((w) => w.id !== widgetId),
    },
  }
}

export function applyPresetToComposition(composition: LayoutComposition, preset: LayoutPreset): LayoutComposition {
  return {
    ...composition,
    ...preset.composition,
    id: composition.id,
    name: composition.name,
  }
}
