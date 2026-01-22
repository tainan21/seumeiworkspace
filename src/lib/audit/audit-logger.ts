"use server";

import { prisma } from "~/lib/server/db";
import { getCurrentSession } from "~/lib/server/auth/session";
import { logger } from "../logger/logger";

/**
 * Tipos de ações auditáveis
 */
export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "VIEW"
  | "LOGIN"
  | "LOGOUT"
  | "PERMISSION_CHANGE"
  | "SETTINGS_CHANGE";

/**
 * Contexto da ação auditada
 */
export interface AuditContext {
  workspaceId?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Registra ação no audit log
 */
export async function logAuditEvent(
  action: AuditAction,
  context?: AuditContext
): Promise<void> {
  try {
    const session = await getCurrentSession();
    const userId = session.user?.id;

    if (!userId) {
      // Não logar se não autenticado (evitar spam)
      return;
    }

    // Registrar no AnalyticsEvent
    if (context?.workspaceId) {
      await prisma.analyticsEvent.create({
        data: {
          workspaceId: context.workspaceId,
          userId,
          eventType: `AUDIT_${action}`,
          entityType: context.entityType,
          entityId: context.entityId,
          properties: context.metadata ? JSON.parse(JSON.stringify(context.metadata)) : {},
        },
      });
    }

    // Log também no logger
    logger.info(`Audit: ${action}`, {
      userId,
      workspaceId: context?.workspaceId,
      entityType: context?.entityType,
      entityId: context?.entityId,
    });
  } catch (error) {
    // Não falhar a operação principal se audit log falhar
    logger.error("Failed to log audit event", error as Error);
  }
}
