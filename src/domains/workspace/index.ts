/**
 * Workspace domain exports
 * Organizado para tree-shaking otimizado
 */

// Services
export {
  createWorkspace,
  getWorkspaceBySlug,
  getWorkspaceById,
  getWorkspacesByUserId,
  isUserMemberOfWorkspace,
  getUserRoleInWorkspace,
  updateWorkspace,
  generateUniqueSlug,
  isSlugUnique,
} from "./services/workspace.service";
export type {
  CreateWorkspacePayload,
  CreateWorkspaceResult,
} from "./services/workspace.service";

// Rules
export {
  enforceSingleFreeWorkspace,
  getUserPlan,
} from "./rules";
export type { WorkspaceLimitResult } from "./rules";

// Menu Assembly
export {
  assembleMenu,
  sortMenuItems,
  groupMenuItems,
} from "./assemble-menu";
export type { MenuComponent, MenuItem } from "./assemble-menu";

// Limits (re-export existing)
export * from "./limits";
