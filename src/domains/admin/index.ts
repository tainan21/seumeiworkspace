/**
 * Admin Domain - Acesso administrativo global
 *
 * Este domain permite que usuários com GlobalUser.role = ADMIN
 * visualizem e gerenciem TODOS os workspaces do sistema.
 *
 * ⚠️ ATENÇÃO: Queries neste domain NÃO filtram por workspaceId
 */

export { AdminService } from "./services/admin.service";
export { requireAdmin, adminMiddleware } from "./middleware/admin.middleware";
export * from "./actions/admin.actions";
export * from "./types";
