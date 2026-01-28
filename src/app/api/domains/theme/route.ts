// ============================================
// API: Theme Domain
// Endpoints para operações de tema
// ============================================

import { type NextRequest, NextResponse } from "next/server"
import {
  validateBrandColors,
  analyzeAccessibility,
  generateCSSVariables,
  getThemePreset,
  suggestComplementaryColors,
  COLOR_PALETTES,
  THEME_PRESETS,
} from "@/domains/theme/theme"
import { findThemeByWorkspaceId, upsertTheme } from "@/lib/db/repositories/theme.repository"

/**
 * GET /api/domains/theme
 * Busca tema de um workspace ou lista presets
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const workspaceId = searchParams.get("workspaceId")
  const action = searchParams.get("action")

  // Listar presets
  if (action === "presets") {
    return NextResponse.json({
      presets: THEME_PRESETS,
      palettes: COLOR_PALETTES,
    })
  }

  // Buscar tema de workspace específico
  if (workspaceId) {
    try {
      const theme = await findThemeByWorkspaceId(workspaceId)

      if (!theme) {
        return NextResponse.json({ error: "Tema não encontrado" }, { status: 404 })
      }

      // Gerar CSS variables
      const cssVariables = generateCSSVariables(theme.colors, theme.style, theme.customColors)

      return NextResponse.json({
        theme,
        cssVariables,
      })
    } catch {
      // Fallback para mock se DB indisponível
      const preset = getThemePreset("minimal")
      return NextResponse.json({
        theme: {
          id: "mock-theme",
          workspaceId,
          style: preset.style,
          colors: preset.colors,
          isDarkMode: false,
        },
        cssVariables: generateCSSVariables(preset.colors, preset.style),
        _mock: true,
      })
    }
  }

  return NextResponse.json({ error: "workspaceId ou action é obrigatório" }, { status: 400 })
}

/**
 * POST /api/domains/theme
 * Cria ou atualiza tema
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { workspaceId, style, colors, customColors, isDarkMode } = body

  if (!workspaceId || !style || !colors) {
    return NextResponse.json({ error: "workspaceId, style e colors são obrigatórios" }, { status: 400 })
  }

  // Validar cores via domain
  const validation = validateBrandColors(colors)
  if (!validation.valid) {
    return NextResponse.json(
      {
        success: false,
        errors: validation.errors,
        warnings: validation.warnings,
      },
      { status: 400 },
    )
  }

  try {
    const result = await upsertTheme({
      workspaceId,
      style,
      colors,
      customColors,
      isDarkMode,
    })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    // Retornar tema + CSS variables
    const cssVariables = generateCSSVariables(result.theme.colors, result.theme.style, result.theme.customColors)

    return NextResponse.json({
      success: true,
      theme: result.theme,
      cssVariables,
      warnings: validation.warnings,
    })
  } catch {
    // Mock fallback
    const preset = getThemePreset(style)
    return NextResponse.json({
      success: true,
      theme: {
        id: "mock-theme-" + Date.now(),
        workspaceId,
        style,
        colors,
        customColors,
        isDarkMode: isDarkMode ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      cssVariables: generateCSSVariables(colors, style, customColors),
      _mock: true,
    })
  }
}

/**
 * POST /api/domains/theme/validate
 * Valida cores e retorna análise de acessibilidade
 */
export async function validateColors(request: NextRequest) {
  const body = await request.json()
  const { colors, style } = body

  if (!colors) {
    return NextResponse.json({ error: "colors é obrigatório" }, { status: 400 })
  }

  const validation = validateBrandColors(colors)
  const accessibility = analyzeAccessibility(colors, style || "minimal")

  return NextResponse.json({
    validation,
    accessibility,
    suggestions: suggestComplementaryColors(colors.primary),
  })
}
