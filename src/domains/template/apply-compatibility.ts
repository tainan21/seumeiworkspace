/**
 * Tipo de empresa
 */
export type CompanyType =
  | "MEI"
  | "Simples"
  | "EIRELI"
  | "Ltda"
  | "SA"
  | "Startup";

/**
 * Template com suas características
 */
export interface Template {
  id: string;
  name: string;
  supportedFeatures: string[];
  requiredFeatures?: string[];
  targetCompanyTypes?: CompanyType[];
}

/**
 * Resultado da verificação de compatibilidade
 */
export interface CompatibilityResult {
  compatible: boolean;
  warnings: string[];
  suggestions: string[];
  adjustedFeatures?: string[];
}

/**
 * Aplica verificação de compatibilidade entre template e features selecionadas
 * 
 * @param template - Template a verificar
 * @param selectedFeatures - Features selecionadas pelo usuário
 * @param companyType - Tipo de empresa
 * @returns CompatibilityResult com status e ajustes necessários
 */
export function applyTemplateCompatibility(
  template: Template,
  selectedFeatures: string[],
  companyType: CompanyType
): CompatibilityResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  const adjustedFeatures = [...selectedFeatures];

  // Verificar features não suportadas pelo template
  const unsupported = selectedFeatures.filter(
    (f) => !template.supportedFeatures.includes(f)
  );

  if (unsupported.length > 0) {
    warnings.push(
      `Features não suportadas pelo template: ${unsupported.join(", ")}`
    );
    suggestions.push(
      'Considere o template "Custom" para acesso completo a todas as features'
    );

    // Remover features não suportadas
    unsupported.forEach((f) => {
      const idx = adjustedFeatures.indexOf(f);
      if (idx > -1) {
        adjustedFeatures.splice(idx, 1);
      }
    });
  }

  // Verificar se template é adequado para o tipo de empresa
  if (
    template.targetCompanyTypes &&
    !template.targetCompanyTypes.includes(companyType)
  ) {
    warnings.push(
      `Template otimizado para: ${template.targetCompanyTypes.join(", ")}`
    );
    suggestions.push(
      `Sugerimos um template mais adequado para ${companyType}`
    );
  }

  // Verificar features obrigatórias do template
  const requiredMissing =
    template.requiredFeatures?.filter(
      (f) => !selectedFeatures.includes(f)
    ) || [];

  if (requiredMissing.length > 0) {
    warnings.push(
      `Features obrigatórias serão adicionadas: ${requiredMissing.join(", ")}`
    );
    requiredMissing.forEach((f) => {
      if (!adjustedFeatures.includes(f)) {
        adjustedFeatures.push(f);
      }
    });
  }

  return {
    compatible: unsupported.length === 0,
    warnings,
    suggestions,
    adjustedFeatures:
      adjustedFeatures.length !== selectedFeatures.length ||
      adjustedFeatures.some((f, i) => f !== selectedFeatures[i])
        ? adjustedFeatures
        : undefined,
  };
}

/**
 * Sugere template alternativo baseado no tipo de empresa
 */
export function suggestAlternativeTemplate(
  companyType: CompanyType
): string {
  const suggestions: Record<CompanyType, string> = {
    MEI: "freelancer",
    Simples: "agency",
    EIRELI: "agency",
    Ltda: "corporate",
    SA: "corporate",
    Startup: "startup-saas",
  };

  return suggestions[companyType] || "custom";
}
