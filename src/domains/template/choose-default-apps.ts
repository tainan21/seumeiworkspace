// ============================================
// DOMAIN: Template - App Recommendations
// ============================================

import type { CompanyType } from "~/domains/template/apply-compatibility";

export type AppPriority = "essential" | "recommended" | "optional";

export interface AppRecommendation {
  apps: string[];
  priority: AppPriority;
}

const APP_RECOMMENDATIONS: Record<CompanyType, string[]> = {
  MEI: ["finances", "clients", "calendar"],
  Simples: ["finances", "clients", "projects", "docs"],
  EIRELI: ["finances", "clients", "projects", "docs", "people"],
  Ltda: ["finances", "clients", "projects", "docs", "people", "reports"],
  SA: ["finances", "clients", "projects", "docs", "people", "reports", "compliance", "analytics"],
  Startup: ["projects", "docs", "people", "analytics", "roadmap", "integrations"],
};

const ANALYTICS_ELIGIBLE_COMPANY_TYPES: CompanyType[] = ["SA", "Startup", "Ltda"];
const ANALYTICS_MIN_EMPLOYEE_COUNT = 5;

/**
 * Retorna apps sugeridos baseado no tipo de empresa e tamanho
 */
export function chooseDefaultAppsByCompanyType(
  companyType: CompanyType,
  employeeCount?: number
): AppRecommendation[] {
  const baseApps = APP_RECOMMENDATIONS[companyType] || APP_RECOMMENDATIONS["Simples"];

  // Ajustar baseado no tamanho
  const additionalApps: string[] = [];

  if (employeeCount && employeeCount > 10) {
    additionalApps.push("people", "teams");
  }
  if (employeeCount && employeeCount > 50) {
    additionalApps.push("departments", "workflows");
  }

  // Conditionally add analytics based on eligibility
  const shouldIncludeAnalytics = shouldRecommendAnalytics(companyType, employeeCount);
  if (shouldIncludeAnalytics && !baseApps.includes("analytics")) {
    additionalApps.push("analytics");
  }

  const essential = baseApps.slice(0, 3);
  const recommended = [...new Set([...baseApps.slice(3), ...additionalApps])];

  return [
    { apps: essential, priority: "essential" },
    { apps: recommended, priority: "recommended" },
  ];
}

/**
 * Determina se analytics deve ser recomendado baseado em tipo de empresa e tamanho
 */
export function shouldRecommendAnalytics(companyType: CompanyType, employeeCount?: number): boolean {
  // Always recommend for SA and Startup
  if (companyType === "SA" || companyType === "Startup") {
    return true;
  }

  // Recommend for eligible company types with sufficient employee count
  if (ANALYTICS_ELIGIBLE_COMPANY_TYPES.includes(companyType)) {
    return (employeeCount ?? 0) >= ANALYTICS_MIN_EMPLOYEE_COUNT;
  }

  return false;
}
