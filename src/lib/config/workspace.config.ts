/**
 * Configurações relacionadas a workspaces
 */

/**
 * Limites padrão por plano
 */
export const WORKSPACE_LIMITS = {
  FREE: {
    maxWorkspaces: 1,
    maxProjects: 3,
    maxMembers: 1,
    maxStorage: 100, // MB
  },
  PRO: {
    maxWorkspaces: 3,
    maxProjects: 10,
    maxMembers: 5,
    maxStorage: 1000, // MB
  },
  ENTERPRISE: {
    maxWorkspaces: Infinity,
    maxProjects: Infinity,
    maxMembers: Infinity,
    maxStorage: Infinity,
  },
} as const;

/**
 * Configurações de onboarding
 */
export const ONBOARDING_CONFIG = {
  bonusCoins: 1000,
  defaultFlowId: "default",
  requiredSteps: [1, 2, 3], // Steps obrigatórios
} as const;

/**
 * Configurações de features
 */
export const FEATURES_CONFIG = {
  trialDays: 7,
  defaultFeatures: ["dashboard", "projects"],
} as const;
