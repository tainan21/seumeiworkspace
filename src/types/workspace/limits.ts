/**
 * Tipos para limites e regras de workspace
 */

export const WORKSPACE_LIMITS = {
  MAX_WORKSPACES_PER_USER: 1,
  MAX_PROJECTS_PER_USER: 3,
} as const;

export type WorkspaceLimit = typeof WORKSPACE_LIMITS;

export interface UserLimits {
  workspaceCount: number;
  projectCount: number;
  canCreateWorkspace: boolean;
  canCreateProject: boolean;
}
