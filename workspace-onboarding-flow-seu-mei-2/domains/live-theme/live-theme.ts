// ============================================
// DOMAIN: Live Theme
// Logica de negocio para tema em tempo real
// ============================================

import type {
  BrandColors,
  ColorVariants,
  LiveThemeCSSVariables,
  TransitionConfig,
  DEFAULT_TRANSITION_CONFIG,
} from "./live-theme.types"

// ============================================
// COLOR CONVERSION UTILITIES
// ============================================

/**
 * Converte hex para RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace("#", "")
  return {
    r: parseInt(cleanHex.slice(0, 2), 16),
    g: parseInt(cleanHex.slice(2, 4), 16),
    b: parseInt(cleanHex.slice(4, 6), 16),
  }
}

/**
 * Converte RGB para hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase()
}

/**
 * Calcula luminancia relativa (WCAG)
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Converte hex para OKLCH (aproximacao para CSS)
 */
export function hexToOklch(hex: string): string {
  const { r, g, b } = hexToRgb(hex)

  // Conversao simplificada para oklch
  const l = getRelativeLuminance(r, g, b)
  const c = Math.sqrt((r / 255 - l) ** 2 + (g / 255 - l) ** 2 + (b / 255 - l) ** 2) * 0.4
  const h = Math.atan2(b / 255 - g / 255, r / 255 - g / 255) * (180 / Math.PI)

  return `oklch(${(l * 0.8 + 0.1).toFixed(3)} ${c.toFixed(3)} ${((h + 360) % 360).toFixed(1)})`
}

// ============================================
// COLOR VARIANT GENERATION
// ============================================

/**
 * Gera variantes de cor de 50 a 950
 */
export function generateColorVariants(baseHex: string): ColorVariants {
  const { r, g, b } = hexToRgb(baseHex)
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

  const variants = {} as ColorVariants

  shades.forEach((shade) => {
    const factor = shade / 1000
    let newR: number, newG: number, newB: number

    if (shade <= 500) {
      // Clarear: interpolar para branco
      const lightFactor = 1 - factor * 2
      newR = Math.round(r + (255 - r) * lightFactor)
      newG = Math.round(g + (255 - g) * lightFactor)
      newB = Math.round(b + (255 - b) * lightFactor)
    } else {
      // Escurecer: interpolar para preto
      const darkFactor = (factor - 0.5) * 2
      newR = Math.round(r * (1 - darkFactor))
      newG = Math.round(g * (1 - darkFactor))
      newB = Math.round(b * (1 - darkFactor))
    }

    variants[shade] = rgbToHex(
      Math.max(0, Math.min(255, newR)),
      Math.max(0, Math.min(255, newG)),
      Math.max(0, Math.min(255, newB))
    )
  })

  return variants
}

/**
 * Determina cor de foreground ideal (preto ou branco)
 */
export function getContrastingForeground(hex: string): string {
  const { r, g, b } = hexToRgb(hex)
  const luminance = getRelativeLuminance(r, g, b)
  return luminance > 0.5 ? "#000000" : "#FFFFFF"
}

// ============================================
// CSS VARIABLE GENERATION
// ============================================

/**
 * Gera todas as variaveis CSS para o tema
 */
export function generateLiveThemeCSSVariables(
  colors: BrandColors,
  isDarkMode: boolean = false
): LiveThemeCSSVariables {
  const primaryVariants = generateColorVariants(colors.primary)
  const accentVariants = generateColorVariants(colors.accent)

  const primaryForeground = getContrastingForeground(colors.primary)
  const accentForeground = getContrastingForeground(colors.accent)

  // Variaveis para modo claro
  if (!isDarkMode) {
    return {
      // Primary variants
      "--rt-primary": colors.primary,
      "--rt-primary-50": primaryVariants[50],
      "--rt-primary-100": primaryVariants[100],
      "--rt-primary-200": primaryVariants[200],
      "--rt-primary-300": primaryVariants[300],
      "--rt-primary-400": primaryVariants[400],
      "--rt-primary-500": primaryVariants[500],
      "--rt-primary-600": primaryVariants[600],
      "--rt-primary-700": primaryVariants[700],
      "--rt-primary-800": primaryVariants[800],
      "--rt-primary-900": primaryVariants[900],
      "--rt-primary-950": primaryVariants[950],
      "--rt-primary-foreground": primaryForeground,

      // Accent variants
      "--rt-accent": colors.accent,
      "--rt-accent-50": accentVariants[50],
      "--rt-accent-100": accentVariants[100],
      "--rt-accent-200": accentVariants[200],
      "--rt-accent-300": accentVariants[300],
      "--rt-accent-400": accentVariants[400],
      "--rt-accent-500": accentVariants[500],
      "--rt-accent-600": accentVariants[600],
      "--rt-accent-700": accentVariants[700],
      "--rt-accent-800": accentVariants[800],
      "--rt-accent-900": accentVariants[900],
      "--rt-accent-950": accentVariants[950],
      "--rt-accent-foreground": accentForeground,

      // Shadcn overrides (light mode)
      "--primary": hexToOklch(colors.primary),
      "--primary-foreground": "oklch(0.985 0 0)",
      "--accent": hexToOklch(accentVariants[100]),
      "--accent-foreground": hexToOklch(colors.primary),
      "--ring": hexToOklch(primaryVariants[400]),

      // Sidebar overrides
      "--sidebar-primary": hexToOklch(colors.primary),
      "--sidebar-primary-foreground": "oklch(0.985 0 0)",
      "--sidebar-accent": hexToOklch(accentVariants[100]),
      "--sidebar-accent-foreground": hexToOklch(colors.primary),
    }
  }

  // Variaveis para modo escuro
  return {
    // Primary variants (same)
    "--rt-primary": colors.primary,
    "--rt-primary-50": primaryVariants[50],
    "--rt-primary-100": primaryVariants[100],
    "--rt-primary-200": primaryVariants[200],
    "--rt-primary-300": primaryVariants[300],
    "--rt-primary-400": primaryVariants[400],
    "--rt-primary-500": primaryVariants[500],
    "--rt-primary-600": primaryVariants[600],
    "--rt-primary-700": primaryVariants[700],
    "--rt-primary-800": primaryVariants[800],
    "--rt-primary-900": primaryVariants[900],
    "--rt-primary-950": primaryVariants[950],
    "--rt-primary-foreground": primaryForeground,

    // Accent variants (same)
    "--rt-accent": colors.accent,
    "--rt-accent-50": accentVariants[50],
    "--rt-accent-100": accentVariants[100],
    "--rt-accent-200": accentVariants[200],
    "--rt-accent-300": accentVariants[300],
    "--rt-accent-400": accentVariants[400],
    "--rt-accent-500": accentVariants[500],
    "--rt-accent-600": accentVariants[600],
    "--rt-accent-700": accentVariants[700],
    "--rt-accent-800": accentVariants[800],
    "--rt-accent-900": accentVariants[900],
    "--rt-accent-950": accentVariants[950],
    "--rt-accent-foreground": accentForeground,

    // Shadcn overrides (dark mode - usar tons mais claros)
    "--primary": hexToOklch(primaryVariants[400]),
    "--primary-foreground": "oklch(0.145 0 0)",
    "--accent": hexToOklch(accentVariants[800]),
    "--accent-foreground": "oklch(0.985 0 0)",
    "--ring": hexToOklch(primaryVariants[600]),

    // Sidebar overrides (dark)
    "--sidebar-primary": hexToOklch(primaryVariants[400]),
    "--sidebar-primary-foreground": "oklch(0.985 0 0)",
    "--sidebar-accent": hexToOklch(accentVariants[800]),
    "--sidebar-accent-foreground": "oklch(0.985 0 0)",
  }
}

// ============================================
// CSS STRING GENERATION
// ============================================

/**
 * Gera string CSS completa para injecao no DOM
 */
export function generateCSSString(
  colors: BrandColors,
  isDarkMode: boolean = false,
  transitionConfig?: TransitionConfig
): string {
  const variables = generateLiveThemeCSSVariables(colors, isDarkMode)
  const transition = transitionConfig || {
    duration: 200,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    properties: [
      "background-color",
      "border-color",
      "color",
      "fill",
      "stroke",
      "box-shadow",
    ],
  }

  const variablesCSS = Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n")

  const transitionCSS = `
  /* Smooth color transitions */
  *,
  *::before,
  *::after {
    transition-property: ${transition.properties.join(", ")};
    transition-duration: ${transition.duration}ms;
    transition-timing-function: ${transition.easing};
  }

  /* Disable transitions for certain elements */
  [data-no-transition],
  [data-no-transition] *,
  .no-transition,
  .no-transition * {
    transition: none !important;
  }
`

  return `
:root {
${variablesCSS}
}

.dark {
${Object.entries(generateLiveThemeCSSVariables(colors, true))
  .map(([key, value]) => `  ${key}: ${value};`)
  .join("\n")}
}

${transitionCSS}
`
}

// ============================================
// DOM UTILITIES
// ============================================

/**
 * Aplica tema ao DOM injetando style element
 */
export function applyThemeToDOM(
  colors: BrandColors,
  isDarkMode: boolean = false,
  styleId: string = "live-theme-variables"
): HTMLStyleElement {
  if (typeof document === "undefined") {
    throw new Error("applyThemeToDOM can only be called in browser environment")
  }

  // Remover style existente
  const existingStyle = document.getElementById(styleId)
  if (existingStyle) {
    existingStyle.remove()
  }

  // Criar novo style element
  const styleElement = document.createElement("style")
  styleElement.id = styleId
  styleElement.textContent = generateCSSString(colors, isDarkMode)

  // Inserir no head
  document.head.appendChild(styleElement)

  return styleElement
}

/**
 * Remove tema do DOM
 */
export function removeThemeFromDOM(styleId: string = "live-theme-variables"): void {
  if (typeof document === "undefined") return

  const existingStyle = document.getElementById(styleId)
  if (existingStyle) {
    existingStyle.remove()
  }
}

// ============================================
// VALIDATION
// ============================================

/**
 * Valida se uma cor hex e valida
 */
export function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
}

/**
 * Normaliza cor hex (adiciona # se necessario, expande 3 digitos para 6)
 */
export function normalizeHexColor(hex: string): string {
  let normalized = hex.trim()

  // Adicionar # se faltando
  if (!normalized.startsWith("#")) {
    normalized = `#${normalized}`
  }

  // Expandir 3 digitos para 6
  if (/^#[A-Fa-f0-9]{3}$/.test(normalized)) {
    normalized = `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`
  }

  return normalized.toUpperCase()
}

/**
 * Valida e normaliza BrandColors
 */
export function validateAndNormalizeBrandColors(
  colors: BrandColors
): { valid: boolean; colors: BrandColors; errors: string[] } {
  const errors: string[] = []

  let primary = normalizeHexColor(colors.primary)
  let accent = normalizeHexColor(colors.accent)

  if (!isValidHexColor(primary)) {
    errors.push(`Cor primária inválida: ${colors.primary}`)
    primary = "#18181B" // fallback
  }

  if (!isValidHexColor(accent)) {
    errors.push(`Cor de destaque inválida: ${colors.accent}`)
    accent = "#3B82F6" // fallback
  }

  return {
    valid: errors.length === 0,
    colors: { primary, accent },
    errors,
  }
}

// ============================================
// DEBOUNCE UTILITY
// ============================================

/**
 * Cria funcao debounced
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }
}
