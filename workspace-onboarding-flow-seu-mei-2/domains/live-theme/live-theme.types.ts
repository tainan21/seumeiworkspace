// ============================================
// DOMAIN: Live Theme Types
// Tipos para o sistema de tema em tempo real
// ============================================

import type { ThemeStyle, BrandColors } from "@/types/workspace"

export type { ThemeStyle, BrandColors }

// ============================================
// CSS VARIABLE GENERATION
// ============================================

/**
 * Variantes de cor geradas (50-950)
 */
export interface ColorVariants {
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

/**
 * Configuracao completa de variaveis CSS para o tema
 */
export interface LiveThemeCSSVariables {
  // Primary variants
  "--rt-primary": string
  "--rt-primary-50": string
  "--rt-primary-100": string
  "--rt-primary-200": string
  "--rt-primary-300": string
  "--rt-primary-400": string
  "--rt-primary-500": string
  "--rt-primary-600": string
  "--rt-primary-700": string
  "--rt-primary-800": string
  "--rt-primary-900": string
  "--rt-primary-950": string
  "--rt-primary-foreground": string

  // Accent variants
  "--rt-accent": string
  "--rt-accent-50": string
  "--rt-accent-100": string
  "--rt-accent-200": string
  "--rt-accent-300": string
  "--rt-accent-400": string
  "--rt-accent-500": string
  "--rt-accent-600": string
  "--rt-accent-700": string
  "--rt-accent-800": string
  "--rt-accent-900": string
  "--rt-accent-950": string
  "--rt-accent-foreground": string

  // Shadcn overrides
  "--primary": string
  "--primary-foreground": string
  "--accent": string
  "--accent-foreground": string
  "--ring": string

  // Sidebar overrides
  "--sidebar-primary": string
  "--sidebar-primary-foreground": string
  "--sidebar-accent": string
  "--sidebar-accent-foreground": string
}

// ============================================
// LIVE THEME STATE
// ============================================

/**
 * Fonte de dados do tema
 */
export type LiveThemeSource = "onboarding" | "config" | "auto"

/**
 * Estado atual do tema em tempo real
 */
export interface LiveThemeState {
  source: LiveThemeSource
  colors: BrandColors
  style: ThemeStyle
  isDarkMode: boolean
  isTransitioning: boolean
  lastUpdated: number
}

/**
 * Configuracao do provider
 */
export interface LiveThemeProviderConfig {
  source: LiveThemeSource
  debounceMs?: number
  transitionDuration?: number
  enableTransitions?: boolean
}

// ============================================
// HOOKS RETURN TYPES
// ============================================

/**
 * Retorno do hook useLiveTheme
 */
export interface UseLiveThemeReturn {
  colors: BrandColors
  primaryVariants: ColorVariants
  accentVariants: ColorVariants
  isDarkMode: boolean
  isTransitioning: boolean
  setColors: (colors: BrandColors) => void
  setPrimaryColor: (color: string) => void
  setAccentColor: (color: string) => void
  toggleDarkMode: () => void
}

// ============================================
// EVENT TYPES
// ============================================

/**
 * Evento de mudanca de tema
 */
export interface ThemeChangeEvent {
  type: "colors" | "style" | "darkMode"
  previousValue: unknown
  newValue: unknown
  timestamp: number
  source: LiveThemeSource
}

/**
 * Callback para mudancas de tema
 */
export type ThemeChangeCallback = (event: ThemeChangeEvent) => void

// ============================================
// TRANSITION CONFIG
// ============================================

/**
 * Configuracao de transicao CSS
 */
export interface TransitionConfig {
  duration: number // ms
  easing: string
  properties: string[]
}

export const DEFAULT_TRANSITION_CONFIG: TransitionConfig = {
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
