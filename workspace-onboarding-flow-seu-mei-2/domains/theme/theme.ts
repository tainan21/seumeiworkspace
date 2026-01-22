// ============================================
// DOMAIN: Theme
// Gerencia temas, cores e tematização do sistema
// ============================================

import type {
  ThemeConfig,
  ThemePreset,
  ColorPalette,
  ThemeCSSVariables,
  ColorValidationResult,
  ThemeValidationResult,
  ThemeValidationError,
  ThemeValidationWarning,
  ContrastResult,
  AccessibilityAnalysis,
  CreateThemeInput,
  UpdateThemeInput,
  ThemeOperationResult,
  CustomColorSet,
  DBWorkspaceTheme,
} from "./theme.types"
import type { ThemeStyle, BrandColors } from "@/types/workspace"

// ============================================
// CONSTANTES E PRESETS
// ============================================

/**
 * Presets de temas disponíveis
 */
export const THEME_PRESETS: ThemePreset[] = [
  {
    style: "minimal",
    name: "Minimal",
    description: "Clean e moderno, foco no conteúdo",
    colors: { primary: "#18181B", accent: "#3B82F6" },
    preview: {
      background: "#FAFAFA",
      surface: "#FFFFFF",
      text: "#18181B",
    },
    customDefaults: {
      background: "#FAFAFA",
      surface: "#FFFFFF",
      text: "#18181B",
      textMuted: "#71717A",
      border: "#E4E4E7",
    },
  },
  {
    style: "corporate",
    name: "Corporativo",
    description: "Profissional e confiável",
    colors: { primary: "#1E40AF", accent: "#059669" },
    preview: {
      background: "#F8FAFC",
      surface: "#FFFFFF",
      text: "#0F172A",
    },
    customDefaults: {
      background: "#F8FAFC",
      surface: "#FFFFFF",
      text: "#0F172A",
      textMuted: "#64748B",
      border: "#E2E8F0",
    },
  },
  {
    style: "playful",
    name: "Vibrante",
    description: "Colorido e energético",
    colors: { primary: "#EC4899", accent: "#F59E0B" },
    preview: {
      background: "#FFFBEB",
      surface: "#FFFFFF",
      text: "#1F2937",
    },
    customDefaults: {
      background: "#FFFBEB",
      surface: "#FFFFFF",
      text: "#1F2937",
      textMuted: "#6B7280",
      border: "#FDE68A",
    },
  },
]

/**
 * Paletas de cores disponíveis
 */
export const COLOR_PALETTES: ColorPalette[] = [
  { id: "palette-1", primary: "#18181B", accent: "#3B82F6", category: "neutral", name: "Slate Blue" },
  { id: "palette-2", primary: "#1E40AF", accent: "#059669", category: "professional", name: "Corporate Green" },
  { id: "palette-3", primary: "#6366F1", accent: "#22D3EE", category: "vibrant", name: "Indigo Cyan" },
  { id: "palette-4", primary: "#EC4899", accent: "#F59E0B", category: "vibrant", name: "Pink Amber" },
  { id: "palette-5", primary: "#10B981", accent: "#8B5CF6", category: "vibrant", name: "Emerald Violet" },
  { id: "palette-6", primary: "#DC2626", accent: "#FBBF24", category: "vibrant", name: "Red Gold" },
  { id: "palette-7", primary: "#7C3AED", accent: "#14B8A6", category: "professional", name: "Purple Teal" },
  { id: "palette-8", primary: "#0891B2", accent: "#F97316", category: "professional", name: "Cyan Orange" },
]

/**
 * Cores padrão do sistema
 */
const SYSTEM_COLORS = {
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
}

// ============================================
// VALIDAÇÃO DE CORES
// ============================================

/**
 * Regex para validar formato hexadecimal
 */
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

/**
 * Valida uma cor hexadecimal
 */
export function validateHexColor(color: string): ColorValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!color) {
    errors.push("Cor é obrigatória")
    return { valid: false, errors, warnings }
  }

  // Normalizar cor (adicionar # se faltando)
  let normalizedValue = color.trim()
  if (!normalizedValue.startsWith("#")) {
    normalizedValue = `#${normalizedValue}`
    warnings.push("Adicionado prefixo # automaticamente")
  }

  // Converter 3 dígitos para 6
  if (/^#[A-Fa-f0-9]{3}$/.test(normalizedValue)) {
    normalizedValue = `#${normalizedValue[1]}${normalizedValue[1]}${normalizedValue[2]}${normalizedValue[2]}${normalizedValue[3]}${normalizedValue[3]}`
    warnings.push("Expandido de 3 para 6 dígitos")
  }

  // Validar formato final
  if (!HEX_COLOR_REGEX.test(normalizedValue)) {
    errors.push("Formato hexadecimal inválido. Use #RRGGBB ou #RGB")
    return { valid: false, errors, warnings }
  }

  // Normalizar para uppercase
  normalizedValue = normalizedValue.toUpperCase()

  return { valid: true, errors, warnings, normalizedValue }
}

/**
 * Valida um conjunto de cores (BrandColors)
 */
export function validateBrandColors(colors: BrandColors): ThemeValidationResult {
  const errors: ThemeValidationError[] = []
  const warnings: ThemeValidationWarning[] = []

  // Validar primary
  const primaryValidation = validateHexColor(colors.primary)
  if (!primaryValidation.valid) {
    errors.push({
      field: "colors.primary",
      message: primaryValidation.errors.join("; "),
      code: "INVALID_HEX",
    })
  }

  // Validar accent
  const accentValidation = validateHexColor(colors.accent)
  if (!accentValidation.valid) {
    errors.push({
      field: "colors.accent",
      message: accentValidation.errors.join("; "),
      code: "INVALID_HEX",
    })
  }

  // Verificar se cores são muito similares
  if (primaryValidation.valid && accentValidation.valid) {
    const similarity = calculateColorSimilarity(primaryValidation.normalizedValue!, accentValidation.normalizedValue!)
    if (similarity > 0.9) {
      warnings.push({
        field: "colors",
        message: "Cores primary e accent são muito similares. Considere maior contraste.",
        code: "SIMILAR_COLORS",
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Valida configuração completa de tema
 */
export function validateThemeConfig(input: CreateThemeInput): ThemeValidationResult {
  const errors: ThemeValidationError[] = []
  const warnings: ThemeValidationWarning[] = []

  // Validar workspaceId
  if (!input.workspaceId) {
    errors.push({
      field: "workspaceId",
      message: "Workspace ID é obrigatório",
      code: "MISSING_REQUIRED",
    })
  }

  // Validar style
  const validStyles: ThemeStyle[] = ["minimal", "corporate", "playful"]
  if (!validStyles.includes(input.style)) {
    errors.push({
      field: "style",
      message: `Estilo inválido. Use: ${validStyles.join(", ")}`,
      code: "INVALID_STYLE",
    })
  }

  // Validar cores
  const colorsValidation = validateBrandColors(input.colors)
  errors.push(...colorsValidation.errors)
  warnings.push(...colorsValidation.warnings)

  // Validar customColors se fornecidas
  if (input.customColors) {
    const customColorFields: (keyof CustomColorSet)[] = [
      "background",
      "surface",
      "text",
      "textMuted",
      "border",
      "success",
      "warning",
      "error",
      "info",
    ]

    for (const field of customColorFields) {
      const value = input.customColors[field]
      if (value) {
        const validation = validateHexColor(value)
        if (!validation.valid) {
          errors.push({
            field: `customColors.${field}`,
            message: validation.errors.join("; "),
            code: "INVALID_HEX",
          })
        }
      }
    }
  }

  // Verificar acessibilidade
  const accessibility = analyzeAccessibility(input.colors, input.style)
  if (accessibility.overallScore < 50) {
    warnings.push({
      field: "colors",
      message: `Score de acessibilidade baixo (${accessibility.overallScore}/100). ${accessibility.recommendations[0] || ""}`,
      code: "ACCESSIBILITY_CONCERN",
    })
  }

  return { valid: errors.length === 0, errors, warnings }
}

// ============================================
// ANÁLISE DE CONTRASTE E ACESSIBILIDADE
// ============================================

/**
 * Converte hex para RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    return { r: 0, g: 0, b: 0 }
  }
  return {
    r: Number.parseInt(result[1], 16),
    g: Number.parseInt(result[2], 16),
    b: Number.parseInt(result[3], 16),
  }
}

/**
 * Calcula luminância relativa (WCAG)
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calcula ratio de contraste entre duas cores
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Avalia nível de contraste WCAG
 */
export function evaluateContrast(color1: string, color2: string): ContrastResult {
  const ratio = calculateContrastRatio(color1, color2)

  let level: ContrastResult["level"] = "Fail"
  if (ratio >= 7) level = "AAA"
  else if (ratio >= 4.5) level = "AA"
  else if (ratio >= 3) level = "AA-Large"

  return {
    ratio: Math.round(ratio * 100) / 100,
    level,
    passes: {
      normalText: ratio >= 4.5,
      largeText: ratio >= 3,
      uiComponents: ratio >= 3,
    },
  }
}

/**
 * Calcula similaridade entre duas cores (0-1)
 */
function calculateColorSimilarity(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  const distance = Math.sqrt(Math.pow(rgb1.r - rgb2.r, 2) + Math.pow(rgb1.g - rgb2.g, 2) + Math.pow(rgb1.b - rgb2.b, 2))

  // Normalizar: 0 = idênticas, 1 = máxima diferença (441.67 = sqrt(255^2 * 3))
  return 1 - distance / 441.67
}

/**
 * Analisa acessibilidade completa do tema
 */
export function analyzeAccessibility(colors: BrandColors, style: ThemeStyle): AccessibilityAnalysis {
  const preset = THEME_PRESETS.find((p) => p.style === style) || THEME_PRESETS[0]
  const background = preset.preview.background
  const text = preset.preview.text

  const primaryOnBackground = evaluateContrast(colors.primary, background)
  const accentOnBackground = evaluateContrast(colors.accent, background)
  const textOnBackground = evaluateContrast(text, background)
  const textOnPrimary = evaluateContrast("#FFFFFF", colors.primary)

  const recommendations: string[] = []

  if (!primaryOnBackground.passes.normalText) {
    recommendations.push("Cor primária pode ter baixo contraste com o fundo")
  }
  if (!textOnPrimary.passes.normalText) {
    recommendations.push("Considere usar texto escuro sobre a cor primária")
  }
  if (calculateColorSimilarity(colors.primary, colors.accent) > 0.85) {
    recommendations.push("Aumente a diferença entre cores primária e secundária")
  }

  // Calcular score geral (média ponderada)
  const scores = [
    (primaryOnBackground.ratio / 7) * 25,
    (accentOnBackground.ratio / 7) * 20,
    (textOnBackground.ratio / 7) * 35,
    (textOnPrimary.ratio / 7) * 20,
  ]
  const overallScore = Math.min(100, Math.round(scores.reduce((a, b) => a + b, 0)))

  return {
    primaryOnBackground,
    accentOnBackground,
    textOnBackground,
    textOnPrimary,
    overallScore,
    recommendations,
  }
}

// ============================================
// GERAÇÃO DE CSS VARIABLES
// ============================================

/**
 * Gera variáveis CSS a partir da configuração de tema
 */
export function generateCSSVariables(
  colors: BrandColors,
  style: ThemeStyle,
  customColors?: CustomColorSet,
): ThemeCSSVariables {
  const preset = THEME_PRESETS.find((p) => p.style === style) || THEME_PRESETS[0]
  const defaults = preset.customDefaults || {}

  // Determinar cor do texto sobre primary
  const primaryLuminance = getRelativeLuminance(...Object.values(hexToRgb(colors.primary)))
  const primaryForeground = primaryLuminance > 0.5 ? "#000000" : "#FFFFFF"

  // Determinar cor do texto sobre accent
  const accentLuminance = getRelativeLuminance(...Object.values(hexToRgb(colors.accent)))
  const accentForeground = accentLuminance > 0.5 ? "#000000" : "#FFFFFF"

  return {
    // Core colors
    "--theme-primary": colors.primary,
    "--theme-primary-foreground": primaryForeground,
    "--theme-accent": colors.accent,
    "--theme-accent-foreground": accentForeground,

    // Background
    "--theme-background": customColors?.background || defaults.background || "#FFFFFF",
    "--theme-surface": customColors?.surface || defaults.surface || "#FFFFFF",
    "--theme-surface-elevated": lightenColor(customColors?.surface || defaults.surface || "#FFFFFF", 5),

    // Text
    "--theme-text": customColors?.text || defaults.text || "#18181B",
    "--theme-text-muted": customColors?.textMuted || defaults.textMuted || "#71717A",
    "--theme-text-inverted": primaryForeground,

    // Borders
    "--theme-border": customColors?.border || defaults.border || "#E4E4E7",
    "--theme-border-muted": lightenColor(customColors?.border || defaults.border || "#E4E4E7", 10),

    // Status colors
    "--theme-success": customColors?.success || SYSTEM_COLORS.success,
    "--theme-warning": customColors?.warning || SYSTEM_COLORS.warning,
    "--theme-error": customColors?.error || SYSTEM_COLORS.error,
    "--theme-info": customColors?.info || SYSTEM_COLORS.info,

    // Shadows
    "--theme-shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "--theme-shadow-md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    "--theme-shadow-lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)",

    // Radius
    "--theme-radius-sm": "0.25rem",
    "--theme-radius-md": "0.5rem",
    "--theme-radius-lg": "0.75rem",
  }
}

/**
 * Clareia uma cor hex
 */
function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  const amount = Math.round(2.55 * percent)

  const r = Math.min(255, rgb.r + amount)
  const g = Math.min(255, rgb.g + amount)
  const b = Math.min(255, rgb.b + amount)

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase()
}

/**
 * Escurece uma cor hex
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  const amount = Math.round(2.55 * percent)

  const r = Math.max(0, rgb.r - amount)
  const g = Math.max(0, rgb.g - amount)
  const b = Math.max(0, rgb.b - amount)

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase()
}

// ============================================
// OPERAÇÕES CRUD
// ============================================

/**
 * Cria configuração de tema para workspace
 * Retorna ThemeConfig pronto para persistir
 */
export function createThemeConfig(input: CreateThemeInput): ThemeOperationResult {
  // Validar input
  const validation = validateThemeConfig(input)
  if (!validation.valid) {
    return { success: false, errors: validation.errors }
  }

  // Normalizar cores
  const primaryNormalized = validateHexColor(input.colors.primary).normalizedValue!
  const accentNormalized = validateHexColor(input.colors.accent).normalizedValue!

  const now = new Date().toISOString()

  const theme: ThemeConfig = {
    id: generateThemeId(),
    workspaceId: input.workspaceId,
    style: input.style,
    colors: {
      primary: primaryNormalized,
      accent: accentNormalized,
    },
    customColors: input.customColors,
    isDarkMode: input.isDarkMode ?? false,
    createdAt: now,
    updatedAt: now,
  }

  return { success: true, theme }
}

/**
 * Atualiza configuração de tema existente
 */
export function updateThemeConfig(existing: ThemeConfig, updates: UpdateThemeInput): ThemeOperationResult {
  const errors: ThemeValidationError[] = []

  // Validar style se fornecido
  if (updates.style) {
    const validStyles: ThemeStyle[] = ["minimal", "corporate", "playful"]
    if (!validStyles.includes(updates.style)) {
      errors.push({
        field: "style",
        message: `Estilo inválido. Use: ${validStyles.join(", ")}`,
        code: "INVALID_STYLE",
      })
    }
  }

  // Validar cores se fornecidas
  if (updates.colors?.primary) {
    const validation = validateHexColor(updates.colors.primary)
    if (!validation.valid) {
      errors.push({
        field: "colors.primary",
        message: validation.errors.join("; "),
        code: "INVALID_HEX",
      })
    }
  }

  if (updates.colors?.accent) {
    const validation = validateHexColor(updates.colors.accent)
    if (!validation.valid) {
      errors.push({
        field: "colors.accent",
        message: validation.errors.join("; "),
        code: "INVALID_HEX",
      })
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  // Merge com configuração existente
  const updatedTheme: ThemeConfig = {
    ...existing,
    style: updates.style ?? existing.style,
    colors: {
      primary: updates.colors?.primary
        ? validateHexColor(updates.colors.primary).normalizedValue!
        : existing.colors.primary,
      accent: updates.colors?.accent
        ? validateHexColor(updates.colors.accent).normalizedValue!
        : existing.colors.accent,
    },
    customColors: updates.customColors ? { ...existing.customColors, ...updates.customColors } : existing.customColors,
    isDarkMode: updates.isDarkMode ?? existing.isDarkMode,
    updatedAt: new Date().toISOString(),
  }

  return { success: true, theme: updatedTheme }
}

/**
 * Aplica preset de tema
 */
export function applyThemePreset(
  workspaceId: string,
  style: ThemeStyle,
  customColors?: Partial<BrandColors>,
): ThemeOperationResult {
  const preset = THEME_PRESETS.find((p) => p.style === style)

  if (!preset) {
    return {
      success: false,
      errors: [
        {
          field: "style",
          message: `Preset '${style}' não encontrado`,
          code: "INVALID_STYLE",
        },
      ],
    }
  }

  return createThemeConfig({
    workspaceId,
    style,
    colors: {
      primary: customColors?.primary || preset.colors.primary,
      accent: customColors?.accent || preset.colors.accent,
    },
    customColors: preset.customDefaults,
    isDarkMode: false,
  })
}

// ============================================
// TRANSFORMAÇÕES DB <-> DOMAIN
// ============================================

/**
 * Transforma DB row para ThemeConfig
 */
export function dbToThemeConfig(db: DBWorkspaceTheme): ThemeConfig {
  return {
    id: db.id,
    workspaceId: db.workspace_id,
    style: db.style,
    colors: {
      primary: db.primary_color,
      accent: db.accent_color,
    },
    customColors: db.custom_colors || undefined,
    isDarkMode: db.is_dark_mode,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  }
}

/**
 * Transforma ThemeConfig para DB row
 */
export function themeConfigToDb(theme: ThemeConfig): DBWorkspaceTheme {
  return {
    id: theme.id,
    workspace_id: theme.workspaceId,
    style: theme.style,
    primary_color: theme.colors.primary,
    accent_color: theme.colors.accent,
    custom_colors: theme.customColors || null,
    is_dark_mode: theme.isDarkMode,
    created_at: theme.createdAt,
    updated_at: theme.updatedAt,
  }
}

// ============================================
// HELPERS
// ============================================

function generateThemeId(): string {
  return "theme_" + Math.random().toString(36).substring(2, 15)
}

/**
 * Obtém preset por style
 */
export function getThemePreset(style: ThemeStyle): ThemePreset {
  return THEME_PRESETS.find((t) => t.style === style) || THEME_PRESETS[0]
}

/**
 * Obtém paleta por ID
 */
export function getColorPalette(id: string): ColorPalette | undefined {
  return COLOR_PALETTES.find((p) => p.id === id)
}

/**
 * Gera CSS inline para aplicar tema
 */
export function generateInlineStyles(colors: BrandColors, style: ThemeStyle, customColors?: CustomColorSet): string {
  const variables = generateCSSVariables(colors, style, customColors)
  return Object.entries(variables)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ")
}

/**
 * Sugere cores complementares
 */
export function suggestComplementaryColors(primary: string): BrandColors[] {
  const rgb = hexToRgb(primary)

  // Cor complementar (oposta no círculo cromático)
  const complementary =
    `#${(255 - rgb.r).toString(16).padStart(2, "0")}${(255 - rgb.g).toString(16).padStart(2, "0")}${(255 - rgb.b).toString(16).padStart(2, "0")}`.toUpperCase()

  // Cor análoga (próxima no círculo)
  const analogous = lightenColor(primary, 20)

  // Cor triádica
  const triadic =
    `#${rgb.g.toString(16).padStart(2, "0")}${rgb.b.toString(16).padStart(2, "0")}${rgb.r.toString(16).padStart(2, "0")}`.toUpperCase()

  return [
    { primary, accent: complementary },
    { primary, accent: analogous },
    { primary, accent: triadic },
  ]
}

// ============================================
// TESTES MENTAIS
// ============================================
/*
TEST: validateHexColor - Cor válida
INPUT: "#3B82F6"
EXPECTED: { valid: true, normalizedValue: "#3B82F6" }

TEST: validateHexColor - Cor sem #
INPUT: "3B82F6"
EXPECTED: { valid: true, normalizedValue: "#3B82F6", warnings: ["Adicionado prefixo #..."] }

TEST: validateHexColor - Cor 3 dígitos
INPUT: "#F00"
EXPECTED: { valid: true, normalizedValue: "#FF0000" }

TEST: validateHexColor - Cor inválida
INPUT: "#GGGGGG"
EXPECTED: { valid: false, errors: ["Formato hexadecimal inválido..."] }

TEST: calculateContrastRatio - Branco sobre preto
INPUT: ("#FFFFFF", "#000000")
EXPECTED: 21 (contraste máximo)

TEST: calculateContrastRatio - Cores similares
INPUT: ("#F0F0F0", "#E0E0E0")
EXPECTED: ~1.1 (baixo contraste)

TEST: evaluateContrast - AAA
INPUT: ("#FFFFFF", "#000000")
EXPECTED: { level: "AAA", passes: { normalText: true, largeText: true } }

TEST: createThemeConfig - Sucesso
INPUT: { workspaceId: "ws_123", style: "minimal", colors: { primary: "#18181B", accent: "#3B82F6" } }
EXPECTED: { success: true, theme: { ... } }

TEST: createThemeConfig - Cor inválida
INPUT: { workspaceId: "ws_123", style: "minimal", colors: { primary: "invalid", accent: "#3B82F6" } }
EXPECTED: { success: false, errors: [{ code: "INVALID_HEX" }] }

TEST: applyThemePreset - Preset válido
INPUT: ("ws_123", "corporate")
EXPECTED: { success: true, theme: { style: "corporate", colors: { primary: "#1E40AF", accent: "#059669" } } }
*/
