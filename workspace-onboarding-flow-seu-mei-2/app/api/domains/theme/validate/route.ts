// ============================================
// API: Theme Validation
// Endpoint para validação de cores
// ============================================

import { type NextRequest, NextResponse } from "next/server"
import {
  validateBrandColors,
  analyzeAccessibility,
  suggestComplementaryColors,
  evaluateContrast,
} from "@/domains/theme/theme"
import type { ThemeStyle } from "@/types/workspace"

/**
 * POST /api/domains/theme/validate
 * Valida cores e retorna análise completa
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { colors, style, backgroundToTest } = body as {
    colors: { primary: string; accent: string }
    style?: ThemeStyle
    backgroundToTest?: string
  }

  if (!colors || !colors.primary || !colors.accent) {
    return NextResponse.json({ error: "colors.primary e colors.accent são obrigatórios" }, { status: 400 })
  }

  // Validação de formato
  const validation = validateBrandColors(colors)

  // Análise de acessibilidade
  const accessibility = analyzeAccessibility(colors, style || "minimal")

  // Contraste customizado se backgroundToTest fornecido
  let customContrast = null
  if (backgroundToTest) {
    customContrast = {
      primaryOnCustom: evaluateContrast(colors.primary, backgroundToTest),
      accentOnCustom: evaluateContrast(colors.accent, backgroundToTest),
    }
  }

  // Sugestões de cores complementares
  const suggestions = suggestComplementaryColors(colors.primary)

  return NextResponse.json({
    valid: validation.valid,
    errors: validation.errors,
    warnings: validation.warnings,
    accessibility,
    customContrast,
    suggestions,
  })
}
