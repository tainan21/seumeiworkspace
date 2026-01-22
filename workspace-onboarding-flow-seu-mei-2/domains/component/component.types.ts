// ============================================
// DOMAIN: Component
// Tipos para arquitetura de componentes modulares
// ============================================

import type { TopBarVariant, ThemeStyle, BrandColors } from "@/types/workspace"

// ============================================
// SIDEBAR CONFIGURATION
// ============================================

export type SidebarVariant = "standard" | "compact" | "mini" | "floating"
export type SidebarPosition = "left" | "right"
export type SidebarBehavior = "fixed" | "collapsible" | "auto-hide"

export interface SidebarConfig {
  variant: SidebarVariant
  position: SidebarPosition
  behavior: SidebarBehavior
  width: {
    expanded: number
    collapsed: number
  }
  showLogo: boolean
  showSearch: boolean
  showUserProfile: boolean
  groupNavigation: boolean
  enableTooltips: boolean
}

export const DEFAULT_SIDEBAR_CONFIG: SidebarConfig = {
  variant: "standard",
  position: "left",
  behavior: "collapsible",
  width: { expanded: 240, collapsed: 72 },
  showLogo: true,
  showSearch: false,
  showUserProfile: false,
  groupNavigation: false,
  enableTooltips: true,
}

// ============================================
// TOPBAR CONFIGURATION
// ============================================

export type TopBarLayout = "centered" | "left-aligned" | "split" | "minimal"

export interface TopBarConfig {
  variant: TopBarVariant
  layout: TopBarLayout
  showSearch: boolean
  showNotifications: boolean
  showUserMenu: boolean
  showBreadcrumbs: boolean
  showQuickActions: boolean
  stickyOnScroll: boolean
  height: number
}

export const DEFAULT_TOPBAR_CONFIG: TopBarConfig = {
  variant: "barTop-A",
  layout: "split",
  showSearch: true,
  showNotifications: true,
  showUserMenu: true,
  showBreadcrumbs: false,
  showQuickActions: false,
  stickyOnScroll: true,
  height: 56,
}

// ============================================
// DASHBOARD LAYOUT CONFIGURATION
// ============================================

export type DashboardLayoutType = "grid" | "masonry" | "list" | "kanban" | "split"
export type WidgetSize = "small" | "medium" | "large" | "full"

export interface WidgetConfig {
  id: string
  type: string
  title: string
  size: WidgetSize
  position: { row: number; col: number }
  span: { rows: number; cols: number }
  visible: boolean
  refreshInterval?: number
  config?: Record<string, unknown>
}

export interface DashboardLayoutConfig {
  type: DashboardLayoutType
  columns: number
  gap: number
  padding: number
  widgets: WidgetConfig[]
  enableDragDrop: boolean
  enableResize: boolean
  responsiveBreakpoints: {
    sm: number
    md: number
    lg: number
    xl: number
  }
}

export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayoutConfig = {
  type: "grid",
  columns: 12,
  gap: 16,
  padding: 24,
  widgets: [],
  enableDragDrop: false,
  enableResize: false,
  responsiveBreakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
}

// ============================================
// CHART CONFIGURATION
// ============================================

export type ChartType = "line" | "bar" | "area" | "pie" | "donut" | "scatter" | "radar" | "gauge"
export type ChartColorScheme = "default" | "brand" | "monochrome" | "divergent" | "sequential"

export interface ChartDataSeries {
  id: string
  name: string
  dataKey: string
  color?: string
  type?: ChartType
  visible?: boolean
}

export interface ChartConfig {
  id: string
  type: ChartType
  title: string
  description?: string
  colorScheme: ChartColorScheme
  series: ChartDataSeries[]
  showLegend: boolean
  showTooltip: boolean
  showGrid: boolean
  animate: boolean
  responsive: boolean
  aspectRatio?: number
  emptyState?: {
    message: string
    icon?: string
  }
}

export const DEFAULT_CHART_CONFIG: Omit<ChartConfig, "id" | "title" | "series"> = {
  type: "bar",
  colorScheme: "brand",
  showLegend: true,
  showTooltip: true,
  showGrid: true,
  animate: true,
  responsive: true,
}

// ============================================
// COMPONENT REGISTRY
// ============================================

export type ComponentCategory = "layout" | "navigation" | "data-display" | "feedback" | "input" | "chart"

export interface ComponentDefinition {
  id: string
  name: string
  category: ComponentCategory
  description: string
  icon: string
  configSchema: Record<string, unknown>
  defaultConfig: Record<string, unknown>
  supportedVariants: string[]
  dependencies?: string[]
}

export interface ComponentRegistry {
  components: ComponentDefinition[]
  categories: ComponentCategory[]
  version: string
}

// ============================================
// LAYOUT COMPOSITION
// ============================================

export interface LayoutComposition {
  id: string
  name: string
  description: string
  sidebar: SidebarConfig
  topbar: TopBarConfig
  dashboard: DashboardLayoutConfig
  theme: ThemeStyle
  colors: BrandColors
}

export interface LayoutPreset {
  id: string
  name: string
  description: string
  thumbnail?: string
  composition: LayoutComposition
  targetUseCases: string[]
}

// ============================================
// CONFIGURATION STATE
// ============================================

export interface ComponentConfigurationState {
  currentLayout: LayoutComposition
  presets: LayoutPreset[]
  isDirty: boolean
  lastSavedAt: string | null
  history: LayoutComposition[]
  historyIndex: number
}

// ============================================
// VALIDATION
// ============================================

export interface ComponentValidationResult {
  valid: boolean
  errors: Array<{
    path: string
    message: string
    severity: "error" | "warning"
  }>
}

// ============================================
// FONT CONFIGURATION
// ============================================

export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
export type FontCategory = "sans-serif" | "serif" | "monospace" | "display" | "handwriting"

export interface FontDefinition {
  family: string
  category: FontCategory
  weights: FontWeight[]
  fallback: string[]
  googleFontsUrl?: string
  variable?: string
}

export interface FontConfig {
  heading: FontDefinition
  body: FontDefinition
  mono: FontDefinition
  display?: FontDefinition
  scale: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    "2xl": string
    "3xl": string
    "4xl": string
  }
  lineHeight: {
    tight: number
    normal: number
    relaxed: number
  }
  letterSpacing: {
    tight: string
    normal: string
    wide: string
  }
}

export const FONT_PRESETS: Record<string, FontConfig> = {
  modern: {
    heading: {
      family: "Inter",
      category: "sans-serif",
      weights: [500, 600, 700],
      fallback: ["system-ui", "sans-serif"],
      variable: "--font-heading",
    },
    body: {
      family: "Inter",
      category: "sans-serif",
      weights: [400, 500],
      fallback: ["system-ui", "sans-serif"],
      variable: "--font-body",
    },
    mono: {
      family: "JetBrains Mono",
      category: "monospace",
      weights: [400, 500],
      fallback: ["Consolas", "monospace"],
      variable: "--font-mono",
    },
    scale: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.75 },
    letterSpacing: { tight: "-0.025em", normal: "0", wide: "0.025em" },
  },
  classic: {
    heading: {
      family: "Playfair Display",
      category: "serif",
      weights: [500, 600, 700],
      fallback: ["Georgia", "serif"],
      variable: "--font-heading",
    },
    body: {
      family: "Source Sans Pro",
      category: "sans-serif",
      weights: [400, 600],
      fallback: ["Arial", "sans-serif"],
      variable: "--font-body",
    },
    mono: {
      family: "Fira Code",
      category: "monospace",
      weights: [400, 500],
      fallback: ["Monaco", "monospace"],
      variable: "--font-mono",
    },
    scale: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "2rem",
      "4xl": "2.5rem",
    },
    lineHeight: { tight: 1.3, normal: 1.6, relaxed: 1.8 },
    letterSpacing: { tight: "-0.02em", normal: "0", wide: "0.05em" },
  },
  minimal: {
    heading: {
      family: "Geist",
      category: "sans-serif",
      weights: [500, 600, 700],
      fallback: ["system-ui", "sans-serif"],
      variable: "--font-heading",
    },
    body: {
      family: "Geist",
      category: "sans-serif",
      weights: [400, 500],
      fallback: ["system-ui", "sans-serif"],
      variable: "--font-body",
    },
    mono: {
      family: "Geist Mono",
      category: "monospace",
      weights: [400, 500],
      fallback: ["Consolas", "monospace"],
      variable: "--font-mono",
    },
    scale: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "0.9375rem",
      lg: "1.0625rem",
      xl: "1.1875rem",
      "2xl": "1.375rem",
      "3xl": "1.75rem",
      "4xl": "2.125rem",
    },
    lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.7 },
    letterSpacing: { tight: "-0.03em", normal: "-0.01em", wide: "0.02em" },
  },
}

// ============================================
// TAILWIND OVERRIDES
// ============================================

export interface ColorDefinition {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

export interface TailwindOverrides {
  colors: {
    primary: ColorDefinition
    secondary: ColorDefinition
    accent: ColorDefinition
    neutral: ColorDefinition
    success: Partial<ColorDefinition>
    warning: Partial<ColorDefinition>
    error: Partial<ColorDefinition>
    info: Partial<ColorDefinition>
  }
  spacing: Record<string, string>
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    xl: string
    "2xl": string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  transitions: {
    fast: string
    normal: string
    slow: string
  }
}

export const DEFAULT_TAILWIND_OVERRIDES: TailwindOverrides = {
  colors: {
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
      950: "#172554",
    },
    secondary: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
      950: "#020617",
    },
    accent: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
      950: "#022c22",
    },
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      950: "#0a0a0a",
    },
    success: { 500: "#22c55e", 600: "#16a34a" },
    warning: { 500: "#f59e0b", 600: "#d97706" },
    error: { 500: "#ef4444", 600: "#dc2626" },
    info: { 500: "#0ea5e9", 600: "#0284c7" },
  },
  spacing: {
    px: "1px",
    "0": "0px",
    "0.5": "0.125rem",
    "1": "0.25rem",
    "1.5": "0.375rem",
    "2": "0.5rem",
    "2.5": "0.625rem",
    "3": "0.75rem",
    "3.5": "0.875rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "7": "1.75rem",
    "8": "2rem",
    "9": "2.25rem",
    "10": "2.5rem",
    "12": "3rem",
    "14": "3.5rem",
    "16": "4rem",
    "20": "5rem",
    "24": "6rem",
  },
  borderRadius: {
    none: "0",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  },
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    normal: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
}

// ============================================
// ENHANCED LAYOUT COMPOSITION
// ============================================

export interface EnhancedLayoutComposition extends LayoutComposition {
  fonts: FontConfig
  tailwind: TailwindOverrides
  slots: LayoutSlots
}

export interface LayoutSlots {
  header?: SlotConfig
  sidebar?: SlotConfig
  main?: SlotConfig
  footer?: SlotConfig
  overlay?: SlotConfig
}

export interface SlotConfig {
  visible: boolean
  position: "static" | "fixed" | "sticky"
  zIndex: number
  className?: string
}

export const DEFAULT_LAYOUT_SLOTS: LayoutSlots = {
  header: { visible: true, position: "sticky", zIndex: 50 },
  sidebar: { visible: true, position: "fixed", zIndex: 40 },
  main: { visible: true, position: "static", zIndex: 1 },
  footer: { visible: false, position: "static", zIndex: 1 },
  overlay: { visible: false, position: "fixed", zIndex: 100 },
}

// ============================================
// COMPONENT FACTORY TYPES
// ============================================

export interface ComponentFactoryConfig<T = unknown> {
  id: string
  type: string
  props: T
  slots?: Record<string, ComponentFactoryConfig>
  children?: ComponentFactoryConfig[]
}

export interface ComponentInstance {
  id: string
  definition: ComponentDefinition
  config: Record<string, unknown>
  state: "mounted" | "unmounted" | "error"
  renderedAt?: Date
}
