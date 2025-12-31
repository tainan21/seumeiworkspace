// src/domains/workspace/limits.constants.ts

/**
 * Regras de Domínio: Limitações por Usuário
 * - 1 Workspace por usuário
 * - 3 Projetos por usuário (dentro do workspace)
 */
export const WORKSPACE_LIMITS = {
  MAX_WORKSPACES_PER_USER: 1,
  MAX_PROJECTS_PER_USER: 3,
} as const;
