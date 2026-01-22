// ============================================
// THEME TYPES - Tipos para domínio de temas
// ============================================

import type { ThemeStyle, BrandColors } from "@/types/workspace"

export type { ThemeStyle, BrandColors }

// ============================================
// CORE THEME TYPES
// ============================================

/**
 * Configuração completa de tema para um workspace
 */
export interface ThemeConfig {
  id: string
  workspaceId: string
  style: ThemeStyle
  colors: BrandColors
  customColors?: CustomColorSet
  isDarkMode: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Set de cores customizadas além de primary/accent
 */
export interface CustomColorSet {
  background?: string
  surface?: string
  text?: string
  textMuted?: string
  border?: string
  success?: string
  warning?: string
  error?: string
  info?: string
}

/**
 * Preset de tema pré-definido
 */
export interface ThemePreset {
  style: ThemeStyle
  name: string
  description: string
  colors: BrandColors
  preview: ThemePreview
  customDefaults?: CustomColorSet
}

/**
 * Preview de tema para seleção
 */
export interface ThemePreview {
  background: string
  surface: string
  text: string
}

/**
 * Paleta de cores disponível para seleção
 */
export interface ColorPalette {
  id: string
  name?: string
  primary: string
  accent: string
  category?: "professional" | "vibrant" | "neutral" | "custom"
}

// ============================================
// CSS VARIABLES TYPES
// ============================================

/**
 * Variáveis CSS geradas a partir do tema
 */
export interface ThemeCSSVariables {
  // Core colors
  "--theme-primary": string
  "--theme-primary-foreground": string
  "--theme-accent": string
  "--theme-accent-foreground": string

  // Background
  "--theme-background": string
  "--theme-surface": string
  "--theme-surface-elevated": string

  // Text
  "--theme-text": string
  "--theme-text-muted": string
  "--theme-text-inverted": string

  // Borders
  "--theme-border": string
  "--theme-border-muted": string

  // Status colors
  "--theme-success": string
  "--theme-warning": string
  "--theme-error": string
  "--theme-info": string

  // Shadows & effects
  "--theme-shadow-sm": string
  "--theme-shadow-md": string
  "--theme-shadow-lg": string

  // Radius
  "--theme-radius-sm": string
  "--theme-radius-md": string
  "--theme-radius-lg": string
}

// ============================================
// VALIDATION TYPES
// ============================================

/**
 * Resultado de validação de cor
 */
export interface ColorValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  normalizedValue?: string
}

/**
 * Resultado de validação de tema completo
 */
export interface ThemeValidationResult {
  valid: boolean
  errors: ThemeValidationError[]
  warnings: ThemeValidationWarning[]
}

export interface ThemeValidationError {
  field: string
  message: string
  code: "INVALID_HEX" | "CONTRAST_TOO_LOW" | "MISSING_REQUIRED" | "INVALID_STYLE"
}

export interface ThemeValidationWarning {
  field: string
  message: string
  code: "LOW_CONTRAST" | "SIMILAR_COLORS" | "ACCESSIBILITY_CONCERN"
}

// ============================================
// CONTRAST & ACCESSIBILITY TYPES
// ============================================

/**
 * Resultado de análise de contraste
 */
export interface ContrastResult {
  ratio: number
  level: "AAA" | "AA" | "AA-Large" | "Fail"
  passes: {
    normalText: boolean
    largeText: boolean
    uiComponents: boolean
  }
}

/**
 * Análise de acessibilidade do tema
 */
export interface AccessibilityAnalysis {
  primaryOnBackground: ContrastResult
  accentOnBackground: ContrastResult
  textOnBackground: ContrastResult
  textOnPrimary: ContrastResult
  overallScore: number // 0-100
  recommendations: string[]
}

// ============================================
// PERSISTENCE TYPES
// ============================================

/**
 * Input para criar/atualizar tema
 */
export interface CreateThemeInput {
  workspaceId: string
  style: ThemeStyle
  colors: BrandColors
  customColors?: CustomColorSet
  isDarkMode?: boolean
}

export interface UpdateThemeInput {
  style?: ThemeStyle
  colors?: Partial<BrandColors>
  customColors?: Partial<CustomColorSet>
  isDarkMode?: boolean
}

/**
 * Resultado de operação de tema
 */
export type ThemeOperationResult =
  | { success: true; theme: ThemeConfig }
  | { success: false; errors: ThemeValidationError[] }

// ============================================
// DATABASE SCHEMA TYPE
// ============================================

/**
 * Schema do banco de dados para temas
 */
export interface DBWorkspaceTheme {
  id: string // UUID, PK
  workspace_id: string // FK workspaces(id), UNIQUE
  style: ThemeStyle // ENUM
  primary_color: string // VARCHAR(7)
  accent_color: string // VARCHAR(7)
  custom_colors: CustomColorSet | null // JSONB
  is_dark_mode: boolean // DEFAULT false
  created_at: string // TIMESTAMPTZ
  updated_at: string // TIMESTAMPTZ
}
