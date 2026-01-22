// ============================================
// API MOCK: POST /api/mock/domains/preview
// Gera preview do workspace sem criar
// ============================================

import { type NextRequest, NextResponse } from "next/server"
import { assembleMenu } from "@/domains/workspace/workspace"
import { applyTemplateCompatibility, chooseDefaultAppsByCompanyType } from "@/domains/template/template"
import { getTemplateById } from "@/lib/mock-data/templates"
import { getTopBarConfig } from "@/lib/mock-data/components"
import { getThemePreset } from "@/lib/mock-data/colors"
import type { OnboardingState, CompanyType } from "@/types/workspace"

interface PreviewRequest {
  payload: Partial<OnboardingState>
}

export async function POST(request: NextRequest) {
  try {
    const body: PreviewRequest = await request.json()
    const { payload } = body

    // Verificar compatibilidade se template selecionado
    let warnings: string[] = []
    let suggestions: string[] = []

    if (payload.selectedTemplate && payload.companyType) {
      const template = getTemplateById(payload.selectedTemplate)
      if (template) {
        const compat = applyTemplateCompatibility(
          template,
          payload.selectedFeatures || [],
          payload.companyType as CompanyType,
        )
        warnings = compat.warnings
        suggestions = compat.suggestions
      }
    }

    // Calcular apps habilitados
    const appRecommendations = chooseDefaultAppsByCompanyType(
      (payload.companyType as CompanyType) || "Simples",
      payload.employeeCount,
    )
    const essentialApps = appRecommendations.find((r) => r.priority === "essential")?.apps || []
    const enabledApps = [...new Set([...essentialApps, ...(payload.selectedFeatures || [])])]

    // Montar menu preview
    const menuItems = assembleMenu(payload.menuComponents || [], enabledApps)

    // Configs
    const topBarConfig = getTopBarConfig(payload.topBarVariant || "barTop-A")
    const themePreset = getThemePreset(payload.theme || "minimal")

    return NextResponse.json({
      previewJson: {
        name: payload.companyName,
        theme: payload.theme,
        apps: enabledApps,
        menuItems,
        topBarVariant: payload.topBarVariant,
        brand: {
          logo: payload.companyLogo,
          colors: payload.brandColors,
        },
      },
      menuItems,
      topBarConfig,
      themeVars: {
        "--primary": payload.brandColors?.primary || themePreset.colors.primary,
        "--accent": payload.brandColors?.accent || themePreset.colors.accent,
        "--background": themePreset.preview.background,
        "--surface": themePreset.preview.surface,
        "--text": themePreset.preview.text,
      },
      warnings,
      suggestions,
    })
  } catch {
    return NextResponse.json({ error: "Erro ao gerar preview" }, { status: 400 })
  }
}
