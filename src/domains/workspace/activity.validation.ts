/**
 * Validação de Activity Log (Domain Layer)
 * Funções puras, framework-agnostic, determinísticas e testáveis
 */

import type { CreateActivityLogData, ActivityAction } from "./activity.types";

/**
 * Resultado da validação
 */
export type ActivityLogValidationResult = {
  valid: boolean;
  error?: string;
};

/**
 * Valida se uma string não está vazia
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Valida se um valor é um objeto válido (não null, não array)
 */
function isValidObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

/**
 * Valida os dados para criar um activity log
 * 
 * Regras:
 * - workspaceId: obrigatório, string não vazia
 * - userId: obrigatório, string não vazia
 * - action: obrigatório, deve ser uma das ações válidas
 * - entityType: obrigatório, deve ser um dos tipos válidos
 * - entityId: opcional, se fornecido deve ser string não vazia
 * - metadata: opcional, se fornecido deve ser objeto válido
 * 
 * @param data - Dados do activity log a serem validados
 * @returns Objeto com resultado da validação e mensagem de erro (se houver)
 */
export function validateActivityLogData(
  data: unknown
): ActivityLogValidationResult {
  // Validação de tipo básico
  if (!isValidObject(data)) {
    return {
      valid: false,
      error: "Dados do activity log devem ser um objeto",
    };
  }

  const activityData = data as Partial<CreateActivityLogData>;

  // Validação de workspaceId
  if (!isNonEmptyString(activityData.workspaceId)) {
    return {
      valid: false,
      error: "workspaceId é obrigatório e deve ser uma string não vazia",
    };
  }

  // Validação de userId
  if (!isNonEmptyString(activityData.userId)) {
    return {
      valid: false,
      error: "userId é obrigatório e deve ser uma string não vazia",
    };
  }

  // Validação de action
  if (!isNonEmptyString(activityData.action)) {
    return {
      valid: false,
      error: "action é obrigatório e deve ser uma string não vazia",
    };
  }

  const validActions: ActivityAction[] = [
    "PROJECT_CREATED",
    "PROJECT_UPDATED",
    "PROJECT_DELETED",
    "SETTINGS_UPDATED",
    "MEMBER_INVITED",
    "MEMBER_REMOVED",
    "MEMBER_ROLE_CHANGED",
  ];

  if (!validActions.includes(activityData.action as ActivityAction)) {
    return {
      valid: false,
      error: `action deve ser uma das ações válidas: ${validActions.join(", ")}`,
    };
  }

  // Validação de entityType
  if (!isNonEmptyString(activityData.entityType)) {
    return {
      valid: false,
      error: "entityType é obrigatório e deve ser uma string não vazia",
    };
  }

  const validEntityTypes = [
    "PROJECT",
    "SETTINGS",
    "MEMBER",
    "WORKSPACE",
  ];

  if (!validEntityTypes.includes(activityData.entityType)) {
    return {
      valid: false,
      error: `entityType deve ser um dos tipos válidos: ${validEntityTypes.join(", ")}`,
    };
  }

  // Validação de entityId (opcional)
  if (activityData.entityId !== undefined) {
    if (!isNonEmptyString(activityData.entityId)) {
      return {
        valid: false,
        error: "entityId, se fornecido, deve ser uma string não vazia",
      };
    }
  }

  // Validação de metadata (opcional)
  if (activityData.metadata !== undefined) {
    if (!isValidObject(activityData.metadata)) {
      return {
        valid: false,
        error: "metadata, se fornecido, deve ser um objeto válido",
      };
    }
  }

  // Validação bem-sucedida
  return {
    valid: true,
  };
}

