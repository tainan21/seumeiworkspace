"use server";

import { getCurrentSession } from "~/lib/server/auth/session";
import { prisma } from "~/lib/server/db";
import { AdminService } from "~/domains/admin/services/admin.service";
import {
  validateActivityLogData,
  type ActivityLogValidationResult,
} from "../activity.validation";
import {
  formatActivityLogForDisplay,
} from "../activity.formatter";
import type {
  CreateActivityLogData,
  ActivityLogDisplay,
  GetActivityLogsOptions,
} from "../activity.types";

const adminService = new AdminService();

/**
 * Verifica se o usuário tem acesso ao workspace
 * Retorna true se:
 * - Usuário é membro ativo do workspace, OU
 * - Usuário é admin global
 */
async function hasWorkspaceAccess(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  // Verifica se é admin global
  const isAdmin = await adminService.isGlobalAdmin(userId);
  if (isAdmin) {
    return true;
  }

  // Verifica se é membro do workspace
  const membership = await (prisma as any).workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
      isActive: true,
    },
  });

  return !!membership;
}

/**
 * Cria um activity log
 * 
 * Valida:
 * - Autenticação do usuário
 * - Acesso ao workspace (membro ou admin)
 * - Dados do log (via domain validation)
 * 
 * @param data - Dados do activity log
 * @returns ID do log criado
 * @throws {Error} Se validação falhar ou usuário não tiver acesso
 */
export async function createActivityLog(
  data: CreateActivityLogData
): Promise<string> {
  // Validação de autenticação
  const { user } = await getCurrentSession();
  if (!user?.id) {
    throw new Error("Usuário não autenticado");
  }

  // Validação de dados (domain layer)
  const validation: ActivityLogValidationResult = validateActivityLogData(data);
  if (!validation.valid) {
    throw new Error(validation.error || "Dados inválidos");
  }

  // Validação de acesso ao workspace
  const hasAccess = await hasWorkspaceAccess(user.id, data.workspaceId);
  if (!hasAccess) {
    throw new Error("Usuário não tem acesso a este workspace");
  }

  // Validação de userId (deve ser o usuário autenticado)
  if (data.userId !== user.id) {
    throw new Error("userId deve ser o usuário autenticado");
  }

  // Buscar email do usuário para o log
  const userData = await (prisma as any).user.findUnique({
    where: { id: user.id },
    select: { email: true },
  });

  // Criar log no banco (usando AuditLog)
  const log = await (prisma as any).auditLog.create({
    data: {
      workspaceId: data.workspaceId,
      userId: data.userId,
      userEmail: userData?.email || null,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId || null,
      metadata: data.metadata || null,
    },
  });

  return log.id;
}

/**
 * Lista activity logs de um workspace
 * 
 * Valida:
 * - Autenticação do usuário
 * - Acesso ao workspace (membro ou admin)
 * 
 * @param workspaceId - ID do workspace
 * @param options - Opções de paginação (limit padrão: 50)
 * @returns Array de logs formatados
 */
export async function getActivityLogs(
  workspaceId: string,
  options: GetActivityLogsOptions = {}
): Promise<ActivityLogDisplay[]> {
  // Validação de autenticação
  const { user } = await getCurrentSession();
  if (!user?.id) {
    throw new Error("Usuário não autenticado");
  }

  // Validação de workspaceId
  if (!workspaceId || typeof workspaceId !== "string") {
    throw new Error("workspaceId é obrigatório");
  }

  // Validação de acesso ao workspace
  const hasAccess = await hasWorkspaceAccess(user.id, workspaceId);
  if (!hasAccess) {
    throw new Error("Usuário não tem acesso a este workspace");
  }

  const limit = options.limit || 50;
  const offset = options.offset || 0;

  // Buscar logs do workspace (sempre filtrar por workspaceId)
  const logs = await (prisma as any).auditLog.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    skip: offset,
  });

  // Buscar nomes dos usuários para formatação
  const userIds = [...new Set(logs.map((log: any) => log.userId).filter(Boolean))];
  const users = userIds.length > 0
    ? await (prisma as any).user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      })
    : [];

  const userMap = new Map(users.map((u: any) => [u.id, u]));

  // Formatar logs para exibição (domain layer)
  return logs.map((log: any) => {
    const user = log.userId ? userMap.get(log.userId) : null;
    return formatActivityLogForDisplay(
      {
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        userId: log.userId || "",
        userEmail: log.userEmail || (user as { email?: string })?.email || undefined,
        workspaceId: log.workspaceId || "",
        createdAt: log.createdAt,
        metadata: log.metadata,
      },
      (user as { name?: string })?.name || undefined
    );
  });
}

/**
 * Lista activity logs de qualquer workspace (apenas admin global)
 * 
 * Valida:
 * - Autenticação do usuário
 * - Permissão de admin global
 * 
 * @param workspaceId - ID do workspace (opcional, se não fornecido retorna vazio)
 * @returns Array de logs formatados
 */
export async function getActivityLogsAdmin(
  workspaceId?: string
): Promise<ActivityLogDisplay[]> {
  // Validação de autenticação
  const { user } = await getCurrentSession();
  if (!user?.id) {
    throw new Error("Usuário não autenticado");
  }

  // Validação de permissão admin
  const isAdmin = await adminService.isGlobalAdmin(user.id);
  if (!isAdmin) {
    throw new Error("Acesso negado: apenas administradores globais");
  }

  // Se não forneceu workspaceId, retorna vazio
  if (!workspaceId) {
    return [];
  }

  // Buscar logs do workspace (admin pode ver qualquer workspace)
  const logs = await (prisma as any).auditLog.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  // Buscar nomes dos usuários para formatação
  const userIds = [...new Set(logs.map((log: any) => log.userId).filter(Boolean))];
  const users = userIds.length > 0
    ? await (prisma as any).user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      })
    : [];

  const userMap = new Map(users.map((u: any) => [u.id, u]));

  // Formatar logs para exibição (domain layer)
  return logs.map((log: any) => {
    const user = log.userId ? userMap.get(log.userId) : null;
    return formatActivityLogForDisplay(
      {
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        userId: log.userId || "",
        userEmail: log.userEmail || (user as { email?: string })?.email || undefined,
        workspaceId: log.workspaceId || "",
        createdAt: log.createdAt,
        metadata: log.metadata,
      },
      (user as { name?: string })?.name || undefined
    );
  });
}

