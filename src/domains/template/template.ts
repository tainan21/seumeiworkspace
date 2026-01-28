// ============================================
// DOMAIN: Template
// Regras de sugestão e compatibilidade
// ============================================

import type { Template, CompanyType, AppRecommendation, CompatibilityResult } from "./template.types"

const APP_RECOMMENDATIONS: Record<CompanyType, string[]> = {
  MEI: ["finances", "clients", "calendar"],
  Simples: ["finances", "clients", "projects", "docs"],
  EIRELI: ["finances", "clients", "projects", "docs", "people"],
  Ltda: ["finances", "clients", "projects", "docs", "people", "reports"],
  SA: ["finances", "clients", "projects", "docs", "people", "reports", "compliance", "analytics"],
  Startup: ["projects", "docs", "people", "analytics", "roadmap", "integrations"],
}

const ANALYTICS_ELIGIBLE_COMPANY_TYPES: CompanyType[] = ["SA", "Startup", "Ltda"]
const ANALYTICS_MIN_EMPLOYEE_COUNT = 5

/**
 * Retorna apps sugeridos baseado no tipo de empresa e tamanho
 */
export function chooseDefaultAppsByCompanyType(companyType: CompanyType, employeeCount?: number): AppRecommendation[] {
  const baseApps = APP_RECOMMENDATIONS[companyType] || APP_RECOMMENDATIONS["Simples"]

  // Ajustar baseado no tamanho
  const additionalApps: string[] = []

  if (employeeCount && employeeCount > 10) {
    additionalApps.push("people", "teams")
  }
  if (employeeCount && employeeCount > 50) {
    additionalApps.push("departments", "workflows")
  }

  // Conditionally add analytics based on eligibility
  const shouldIncludeAnalytics = shouldRecommendAnalytics(companyType, employeeCount)
  if (shouldIncludeAnalytics && !baseApps.includes("analytics")) {
    additionalApps.push("analytics")
  }

  const essential = baseApps.slice(0, 3)
  const recommended = [...new Set([...baseApps.slice(3), ...additionalApps])]

  return [
    { apps: essential, priority: "essential" },
    { apps: recommended, priority: "recommended" },
  ]
}

/**
 * Determina se analytics deve ser recomendado baseado em tipo de empresa e tamanho
 */
export function shouldRecommendAnalytics(companyType: CompanyType, employeeCount?: number): boolean {
  // Always recommend for SA and Startup
  if (companyType === "SA" || companyType === "Startup") {
    return true
  }

  // Recommend for eligible company types with sufficient employee count
  if (ANALYTICS_ELIGIBLE_COMPANY_TYPES.includes(companyType)) {
    return (employeeCount ?? 0) >= ANALYTICS_MIN_EMPLOYEE_COUNT
  }

  return false
}

/**
 * Retorna razão pela qual analytics é ou não recomendado
 */
export function getAnalyticsRecommendationReason(
  companyType: CompanyType,
  employeeCount?: number,
): { recommended: boolean; reason: string } {
  if (companyType === "SA" || companyType === "Startup") {
    return {
      recommended: true,
      reason: `Analytics é essencial para empresas ${companyType} para acompanhar crescimento e métricas.`,
    }
  }

  if (!ANALYTICS_ELIGIBLE_COMPANY_TYPES.includes(companyType)) {
    return {
      recommended: false,
      reason: `Analytics é mais adequado para empresas maiores. Considere quando sua empresa crescer.`,
    }
  }

  if ((employeeCount ?? 0) < ANALYTICS_MIN_EMPLOYEE_COUNT) {
    return {
      recommended: false,
      reason: `Analytics é recomendado para equipes com ${ANALYTICS_MIN_EMPLOYEE_COUNT}+ colaboradores. Você tem ${employeeCount ?? 0}.`,
    }
  }

  return {
    recommended: true,
    reason: `Com ${employeeCount} colaboradores, analytics ajudará a monitorar produtividade e engajamento.`,
  }
}

/**
 * Sugere template alternativo para tipo de empresa
 */
function suggestAlternativeTemplate(companyType: CompanyType): string {
  const suggestions: Record<CompanyType, string> = {
    MEI: "freelancer",
    Simples: "agency",
    EIRELI: "agency",
    Ltda: "corporate",
    SA: "corporate",
    Startup: "startup-saas",
  }
  return suggestions[companyType] || "startup-saas"
}

/**
 * Verifica compatibilidade entre template, features e tipo de empresa
 * - NÃO faz mudanças silenciosas
 * - Retorna warnings e requiresConsent quando há ajustes necessários
 */
export function applyTemplateCompatibility(
  template: Template,
  selectedFeatures: string[],
  companyType: CompanyType,
): CompatibilityResult {
  const warnings: string[] = []
  const suggestions: string[] = []
  let requiresConsent = false

  // Verificar features não suportadas pelo template
  const unsupported = selectedFeatures.filter((f) => !template.supportedFeatures.includes(f))

  if (unsupported.length > 0) {
    warnings.push(`Features não suportadas neste template: ${unsupported.join(", ")}`)
    suggestions.push('Essas features serão removidas. Considere o template "Custom" para acesso completo.')
    requiresConsent = true
  }

  // Verificar se template é adequado para o tipo de empresa
  if (
    template.targetCompanyTypes &&
    template.targetCompanyTypes.length > 0 &&
    !template.targetCompanyTypes.includes(companyType)
  ) {
    warnings.push(`Este template é otimizado para: ${template.targetCompanyTypes.join(", ")}`)
    suggestions.push(`Para ${companyType}, sugerimos: ${suggestAlternativeTemplate(companyType)}`)
  }

  // Verificar features obrigatórias do template que estão faltando
  const requiredMissing = (template.requiredFeatures || []).filter((f) => !selectedFeatures.includes(f))

  if (requiredMissing.length > 0) {
    warnings.push(`Features obrigatórias serão adicionadas: ${requiredMissing.join(", ")}`)
    requiresConsent = true
  }

  // Calcular features ajustadas (somente se usuário consentir)
  const adjustedFeatures = [...selectedFeatures.filter((f) => !unsupported.includes(f)), ...requiredMissing]

  return {
    compatible: unsupported.length === 0 && requiredMissing.length === 0,
    warnings,
    suggestions,
    adjustedFeatures: adjustedFeatures.length !== selectedFeatures.length ? adjustedFeatures : undefined,
    requiresConsent,
  }
}

// ============================================
// TESTES
// ============================================
/*
TEST: chooseDefaultAppsByCompanyType - MEI
INPUT: ('MEI', 1)
EXPECTED: [{ apps: ['finances', 'clients', 'calendar'], priority: 'essential' }, { apps: [], priority: 'recommended' }]

TEST: chooseDefaultAppsByCompanyType - Empresa grande
INPUT: ('Ltda', 100)
EXPECTED: Inclui 'departments' e 'workflows' nos recommended

TEST: applyTemplateCompatibility - Features não suportadas
INPUT: (templateFreelancer, ['analytics', 'compliance'], 'MEI')
EXPECTED: { compatible: false, warnings: [...], requiresConsent: true }

TEST: applyTemplateCompatibility - Features obrigatórias faltando
INPUT: (templateAgency, ['docs'], 'Simples') // agency requer projects e clients
EXPECTED: { warnings: ['Features obrigatórias serão adicionadas: projects, clients'], requiresConsent: true }

TEST: applyTemplateCompatibility - Tipo empresa não adequado
INPUT: (templateCorporate, ['projects'], 'MEI')
EXPECTED: { warnings: ['Este template é otimizado para: Ltda, SA'], suggestions: ['...freelancer'] }
*/
