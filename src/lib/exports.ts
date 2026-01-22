/**
 * Exports principais da aplicação
 * Centraliza exports comuns para facilitar imports
 */

// Domains
export * from "~/domains/shared";
export * from "~/domains/workspace";
export * from "~/domains/company";
export * from "~/domains/template";
export * from "~/domains/rbac";
export * from "~/domains/features";
export * from "~/domains/projects/services/project.service";

// Errors
export * from "~/lib/errors";

// Logger
export * from "~/lib/logger";

// Validation
export * from "~/lib/validation";

// Hooks
export * from "~/lib/hooks";

// Middleware
export {
  workspaceMiddleware,
  getWorkspaceContext,
  type WorkspaceContext
} from "~/lib/middleware/workspace.middleware";
export * from "~/lib/middleware/onboarding.middleware";
