/**
 * Configurações de features e marketplace
 */

/**
 * Categorias de features disponíveis
 */
export const FEATURE_CATEGORIES = [
  "CORE",
  "AI",
  "AUTOMATION",
  "UI",
  "INTEGRATION",
] as const;

/**
 * Preços padrão de features (em coins)
 */
export const FEATURE_PRICES: Record<string, number> = {
  analytics: 500,
  reports: 300,
  integrations: 800,
  ai_assistant: 1000,
};

/**
 * Features incluídas em cada plano
 */
export const PLAN_FEATURES: Record<string, string[]> = {
  FREE: ["dashboard", "projects"],
  PRO: ["dashboard", "projects", "analytics", "reports"],
  ENTERPRISE: ["*"], // Todas as features
};
