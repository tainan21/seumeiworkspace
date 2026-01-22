"use client"

import React, { useEffect, useCallback, useRef, useMemo } from "react"
import { useOnboardingStore } from "@/lib/stores/onboarding-store"
import { useComponentConfigStore } from "@/lib/stores/component-config-store"
import {
  generateCSSString,
  generateColorVariants,
  validateAndNormalizeBrandColors,
  debounce,
} from "@/domains/live-theme/live-theme"
import type {
  LiveThemeSource,
  ColorVariants,
  BrandColors,
} from "@/domains/live-theme/live-theme.types"

// ============================================
// PROVIDER PROPS
// ============================================

interface RealTimeThemeProviderProps {
  children: React.ReactNode
  /** Fonte de dados do tema: onboarding, config, ou auto (prioriza onboarding) */
  source?: LiveThemeSource
  /** Tempo de debounce em ms (default: 50) */
  debounceMs?: number
  /** Habilitar transicoes suaves (default: true) */
  enableTransitions?: boolean
  /** Duracao da transicao em ms (default: 200) */
  transitionDuration?: number
}

// ============================================
// PROVIDER COMPONENT
// ============================================

export function RealTimeThemeProvider({
  children,
  source = "auto",
  debounceMs = 50,
  enableTransitions = true,
  transitionDuration = 200,
}: RealTimeThemeProviderProps) {
  const styleRef = useRef<HTMLStyleElement | null>(null)
  const lastColorsRef = useRef<string>("")

  // Pegar cores do onboarding store
  const onboardingColors = useOnboardingStore((state) => state.brandColors)
  const onboardingTheme = useOnboardingStore((state) => state.theme)

  // Pegar cores do component config store
  const configColors = useComponentConfigStore((state) => state.composition.colors)

  // Determinar qual fonte usar
  const activeColors = useMemo((): BrandColors => {
    if (source === "onboarding") {
      return onboardingColors
    }
    if (source === "config") {
      return configColors
    }
    // auto: prioriza onboarding se tiver cores definidas
    if (onboardingColors.primary !== "#18181B" || onboardingColors.accent !== "#3B82F6") {
      return onboardingColors
    }
    return configColors
  }, [source, onboardingColors, configColors])

  // Validar e normalizar cores
  const { colors: normalizedColors } = useMemo(
    () => validateAndNormalizeBrandColors(activeColors),
    [activeColors]
  )

  // Aplicar tema ao DOM
  const applyTheme = useCallback(() => {
    if (typeof document === "undefined") return

    // Serializar cores para comparacao
    const colorsKey = `${normalizedColors.primary}-${normalizedColors.accent}`

    // Skip se as cores nao mudaram
    if (colorsKey === lastColorsRef.current) return
    lastColorsRef.current = colorsKey

    // Criar ou reutilizar style element
    if (!styleRef.current) {
      styleRef.current = document.createElement("style")
      styleRef.current.id = "real-time-theme"
      document.head.appendChild(styleRef.current)
    }

    // Gerar CSS com transicoes configuradas
    const transitionConfig = enableTransitions
      ? {
          duration: transitionDuration,
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
      : undefined

    const css = generateCSSString(normalizedColors, false, transitionConfig)
    styleRef.current.textContent = css
  }, [normalizedColors, enableTransitions, transitionDuration])

  // Criar versao debounced do applyTheme
  const debouncedApplyTheme = useMemo(
    () => debounce(applyTheme, debounceMs),
    [applyTheme, debounceMs]
  )

  // Aplicar tema quando cores mudam
  useEffect(() => {
    // Aplicar imediatamente na primeira vez
    applyTheme()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-aplicar com debounce quando cores mudam
  useEffect(() => {
    debouncedApplyTheme()
  }, [normalizedColors.primary, normalizedColors.accent, debouncedApplyTheme])

  // Cleanup
  useEffect(() => {
    return () => {
      if (styleRef.current && styleRef.current.parentNode) {
        styleRef.current.parentNode.removeChild(styleRef.current)
      }
    }
  }, [])

  return <>{children}</>
}

// ============================================
// HOOK: useRealTimeTheme
// ============================================

export interface UseRealTimeThemeReturn {
  colors: BrandColors
  primaryVariants: ColorVariants
  accentVariants: ColorVariants
  setPrimaryColor: (color: string) => void
  setAccentColor: (color: string) => void
  setColors: (colors: BrandColors) => void
}

/**
 * Hook para usar o tema em tempo real em componentes
 * Retorna as cores atuais e funcoes para modifica-las
 */
export function useRealTimeTheme(): UseRealTimeThemeReturn {
  const onboardingColors = useOnboardingStore((state) => state.brandColors)
  const setBrandColors = useOnboardingStore((state) => state.setBrandColors)

  const primaryVariants = useMemo(
    () => generateColorVariants(onboardingColors.primary),
    [onboardingColors.primary]
  )

  const accentVariants = useMemo(
    () => generateColorVariants(onboardingColors.accent),
    [onboardingColors.accent]
  )

  const setPrimaryColor = useCallback(
    (color: string) => {
      setBrandColors({ ...onboardingColors, primary: color })
    },
    [onboardingColors, setBrandColors]
  )

  const setAccentColor = useCallback(
    (color: string) => {
      setBrandColors({ ...onboardingColors, accent: color })
    },
    [onboardingColors, setBrandColors]
  )

  const setColors = useCallback(
    (colors: BrandColors) => {
      setBrandColors(colors)
    },
    [setBrandColors]
  )

  return {
    colors: onboardingColors,
    primaryVariants,
    accentVariants,
    setPrimaryColor,
    setAccentColor,
    setColors,
  }
}

// ============================================
// HOOK: useLiveThemeCSS
// ============================================

/**
 * Hook para obter as variaveis CSS do tema atual
 * Util para componentes que precisam usar as cores dinamicamente
 */
export function useLiveThemeCSS() {
  const onboardingColors = useOnboardingStore((state) => state.brandColors)

  return useMemo(() => {
    const primaryVariants = generateColorVariants(onboardingColors.primary)
    const accentVariants = generateColorVariants(onboardingColors.accent)

    return {
      primary: onboardingColors.primary,
      accent: onboardingColors.accent,
      primaryVariants,
      accentVariants,
      // CSS custom properties para uso inline
      cssVars: {
        "--rt-primary": onboardingColors.primary,
        "--rt-accent": onboardingColors.accent,
        "--rt-primary-100": primaryVariants[100],
        "--rt-primary-500": primaryVariants[500],
        "--rt-primary-900": primaryVariants[900],
        "--rt-accent-100": accentVariants[100],
        "--rt-accent-500": accentVariants[500],
        "--rt-accent-900": accentVariants[900],
      } as React.CSSProperties,
    }
  }, [onboardingColors])
}
