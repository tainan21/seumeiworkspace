/**
 * Tipos puros para Activity Log (Domain Layer)
 * Framework-agnostic, sem dependências de infra ou UI
 */

/**
 * Ações que podem ser registradas no activity log
 */
export type ActivityAction =
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "PROJECT_DELETED"
  | "SETTINGS_UPDATED"
  | "MEMBER_INVITED"
  | "MEMBER_REMOVED"
  | "MEMBER_ROLE_CHANGED";

/**
 * Tipo de entidade relacionada à ação
 */
export type ActivityEntityType =
  | "PROJECT"
  | "SETTINGS"
  | "MEMBER"
  | "WORKSPACE";

/**
 * Dados para criar um activity log
 */
export interface CreateActivityLogData {
  workspaceId: string;
  userId: string;
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Activity log formatado para exibição
 */
export interface ActivityLogDisplay {
  id: string;
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId?: string;
  userId: string;
  userEmail?: string;
  workspaceId: string;
  timestamp: Date;
  formattedMessage: string;
  metadata?: Record<string, unknown>;
}

/**
 * Opções para listar activity logs
 */
export interface GetActivityLogsOptions {
  limit?: number;
  offset?: number;
}

