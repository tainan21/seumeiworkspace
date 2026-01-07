/**
 * Formatação de Activity Log para exibição (Domain Layer)
 * Funções puras, framework-agnostic, determinísticas e testáveis
 */

import type {
  ActivityAction,
  ActivityEntityType,
  ActivityLogDisplay,
} from "./activity.types";

/**
 * Mapeamento de ações para mensagens amigáveis em português
 */
const ACTION_MESSAGES: Record<ActivityAction, string> = {
  PROJECT_CREATED: "criou o projeto",
  PROJECT_UPDATED: "atualizou o projeto",
  PROJECT_DELETED: "deletou o projeto",
  SETTINGS_UPDATED: "atualizou as configurações",
  MEMBER_INVITED: "convidou um membro",
  MEMBER_REMOVED: "removeu um membro",
  MEMBER_ROLE_CHANGED: "alterou a função de um membro",
};

/**
 * Mapeamento de tipos de entidade para nomes amigáveis
 */
const ENTITY_TYPE_NAMES: Record<ActivityEntityType, string> = {
  PROJECT: "Projeto",
  SETTINGS: "Configurações",
  MEMBER: "Membro",
  WORKSPACE: "Workspace",
};

/**
 * Formata uma mensagem amigável para um activity log
 * 
 * @param action - Ação realizada
 * @param entityType - Tipo de entidade
 * @param entityId - ID da entidade (opcional)
 * @param userName - Nome do usuário (opcional)
 * @returns Mensagem formatada
 */
export function formatActivityMessage(
  action: ActivityAction,
  entityType: ActivityEntityType,
  entityId?: string,
  userName?: string
): string {
  const actionMessage = ACTION_MESSAGES[action];
  const entityName = ENTITY_TYPE_NAMES[entityType];
  
  const userPrefix = userName ? `${userName} ` : "Usuário ";
  
  if (entityId) {
    return `${userPrefix}${actionMessage} ${entityName} (${entityId})`;
  }
  
  return `${userPrefix}${actionMessage} ${entityName}`;
}

/**
 * Formata um activity log para exibição
 * 
 * @param log - Dados do log do banco de dados
 * @param userName - Nome do usuário (opcional)
 * @returns Log formatado para exibição
 */
export function formatActivityLogForDisplay(
  log: {
    id: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    userId: string;
    userEmail?: string | null;
    workspaceId: string;
    createdAt: Date;
    metadata?: unknown;
  },
  userName?: string
): ActivityLogDisplay {
  const formattedMessage = formatActivityMessage(
    log.action as ActivityAction,
    log.entityType as ActivityEntityType,
    log.entityId || undefined,
    userName
  );

  // Validar se action e entityType são válidos
  const validActions: ActivityAction[] = [
    "PROJECT_CREATED",
    "PROJECT_UPDATED",
    "PROJECT_DELETED",
    "SETTINGS_UPDATED",
    "MEMBER_INVITED",
    "MEMBER_REMOVED",
    "MEMBER_ROLE_CHANGED",
  ];

  const validEntityTypes: ActivityEntityType[] = [
    "PROJECT",
    "SETTINGS",
    "MEMBER",
    "WORKSPACE",
  ];

  const action = validActions.includes(log.action as ActivityAction)
    ? (log.action as ActivityAction)
    : ("SETTINGS_UPDATED" as ActivityAction);

  const entityType = validEntityTypes.includes(log.entityType as ActivityEntityType)
    ? (log.entityType as ActivityEntityType)
    : ("WORKSPACE" as ActivityEntityType);

  return {
    id: log.id,
    action,
    entityType,
    entityId: log.entityId || undefined,
    userId: log.userId,
    userEmail: log.userEmail || undefined,
    workspaceId: log.workspaceId,
    timestamp: log.createdAt,
    formattedMessage,
    metadata:
      log.metadata && typeof log.metadata === "object" && !Array.isArray(log.metadata)
        ? (log.metadata as Record<string, unknown>)
        : undefined,
  };
}

