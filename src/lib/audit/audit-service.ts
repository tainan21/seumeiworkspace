"use server";

import { prisma } from "~/lib/server/db";
import { logAuditEvent, type AuditAction, type AuditContext } from "./audit-logger";

/**
 * Service para buscar e gerenciar audit logs
 */

export interface AuditLogFilters {
  workspaceId?: string;
  userId?: string;
  eventType?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  search?: string;
}

/**
 * Busca logs de auditoria
 */
export async function getAuditLogs(filters: AuditLogFilters = {}) {
  const {
    workspaceId,
    userId,
    eventType,
    entityType,
    startDate,
    endDate,
    limit = 50,
    offset = 0,
  } = filters;

  const where: any = {};

  if (workspaceId) {
    where.workspaceId = workspaceId;
  }

  if (userId) {
    where.userId = userId;
  }

  if (eventType) {
    where.eventType = eventType;
  }

  if (entityType) {
    where.entityType = entityType;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  const [events, total] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.analyticsEvent.count({ where }),
  ]);

  return {
    events,
    total,
    page: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Helper para logar ações comuns
 */
export const audit = {
  create: (context: AuditContext) => logAuditEvent("CREATE", context),
  update: (context: AuditContext) => logAuditEvent("UPDATE", context),
  delete: (context: AuditContext) => logAuditEvent("DELETE", context),
  view: (context: AuditContext) => logAuditEvent("VIEW", context),
  login: (context?: AuditContext) => logAuditEvent("LOGIN", context),
  logout: (context?: AuditContext) => logAuditEvent("LOGOUT", context),
  permissionChange: (context: AuditContext) =>
    logAuditEvent("PERMISSION_CHANGE", context),
  settingsChange: (context: AuditContext) =>
    logAuditEvent("SETTINGS_CHANGE", context),
};
