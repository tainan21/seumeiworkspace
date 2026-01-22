"use client"

import React from "react"

// ============================================
// PROVIDER: CSS Variables
// Injeta variáveis CSS dinamicamente baseado na configuração
// ============================================

import { useEffect, useMemo } from "react"
import { useComponentConfigStore } from "@/lib/stores/component-config-store"

interface CSSVariablesProviderProps {
  children: React.ReactNode
}

export function CSSVariablesProvider({ children }: CSSVariablesProviderProps) {
  const generateCSSVariables = useComponentConfigStore((state) => state.generateCSSVariables)
  const composition = useComponentConfigStore((state) => state.composition)

  const cssVariables = useMemo(() => {
    return generateCSSVariables()
  }, [generateCSSVariables, composition])

  useEffect(() => {
    const root = document.documentElement

    // Apply all CSS variables to :root
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // Cleanup function to remove variables when component unmounts
    return () => {
      Object.keys(cssVariables).forEach((key) => {
        root.style.removeProperty(key)
      })
    }
  }, [cssVariables])

  return <>{children}</>
}

// ============================================
// HOOK: useCSSVariable
// Hook para acessar variáveis CSS específicas
// ============================================

export function useCSSVariable(variableName: string): string {
  const generateCSSVariables = useComponentConfigStore((state) => state.generateCSSVariables)
  const composition = useComponentConfigStore((state) => state.composition)

  return useMemo(() => {
    const vars = generateCSSVariables()
    return vars[variableName] || ""
  }, [generateCSSVariables, composition, variableName])
}

// ============================================
// COMPONENT: StyleInjector
// Injeta estilos inline para preview
// ============================================

interface StyleInjectorProps {
  styles: Record<string, string>
  scope?: string
}

export function StyleInjector({ styles, scope }: StyleInjectorProps) {
  const cssString = useMemo(() => {
    const selector = scope ? `.${scope}` : ":root"
    const declarations = Object.entries(styles)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join("\n")
    return `${selector} {\n${declarations}\n}`
  }, [styles, scope])

  return <style dangerouslySetInnerHTML={{ __html: cssString }} />
}

// ============================================
// COMPONENT: FontLoader
// Carrega fontes do Google Fonts dinamicamente
// ============================================

export function FontLoader() {
  const fonts = useComponentConfigStore((state) => state.composition.fonts)

  const fontUrl = useMemo(() => {
    const families: string[] = []

    // Heading font
    if (fonts.heading.googleFontsUrl) {
      families.push(fonts.heading.googleFontsUrl)
    } else {
      const weights = fonts.heading.weights.join(";")
      families.push(`family=${fonts.heading.family.replace(/\s+/g, "+")}:wght@${weights}`)
    }

    // Body font (if different from heading)
    if (fonts.body.family !== fonts.heading.family) {
      const weights = fonts.body.weights.join(";")
      families.push(`family=${fonts.body.family.replace(/\s+/g, "+")}:wght@${weights}`)
    }

    // Mono font
    if (fonts.mono.family !== "Geist Mono") {
      const weights = fonts.mono.weights.join(";")
      families.push(`family=${fonts.mono.family.replace(/\s+/g, "+")}:wght@${weights}`)
    }

    // Display font (if exists and different)
    if (fonts.display && fonts.display.family !== fonts.heading.family) {
      const weights = fonts.display.weights.join(";")
      families.push(`family=${fonts.display.family.replace(/\s+/g, "+")}:wght@${weights}`)
    }

    if (families.length === 0) return null

    return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`
  }, [fonts])

  if (!fontUrl) return null

  return (
    // eslint-disable-next-line @next/next/no-page-custom-font
    <link rel="stylesheet" href={fontUrl} />
  )
}

// ============================================
// COMPONENT: ThemeProvider wrapper
// Combina todos os providers de tema
// ============================================

interface ThemeConfigProviderProps {
  children: React.ReactNode
  enableFontLoading?: boolean
}

export function ThemeConfigProvider({
  children,
  enableFontLoading = true,
}: ThemeConfigProviderProps) {
  return (
    <CSSVariablesProvider>
      {enableFontLoading && <FontLoader />}
      {children}
    </CSSVariablesProvider>
  )
}
