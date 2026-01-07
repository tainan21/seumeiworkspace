"use server";

import { getCurrentSession } from "~/lib/server/auth/session";
import { prisma } from "~/lib/server/db";
import { AdminService } from "../services/admin.service";
import type {
  AdminActivityFilters,
  AdminActivityLog,
  AdminActivityLogsResponse,
  AdminActivityStats,
} from "../types";

const adminService = new AdminService();

/**
 * Verifica se o usuário atual é admin global
 * Lança erro se não for
 */
async function requireAdmin() {
  const { user } = await getCurrentSession();
  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const isAdmin = await adminService.isGlobalAdmin(user.id);
  if (!isAdmin) {
    throw new Error("Acesso negado: apenas administradores globais");
  }

  return user.id;
}

/**
 * Lista TODOS os activity logs do sistema (Admin Global)
 * 
 * ⚠️ EXCEÇÃO MULTI-TENANT (ContratoDeSistemaImutavel.md seção 1)
 * Admin Global pode acessar logs de TODOS os workspaces
 * Esta é uma exceção explícita e aprovada para domínio admin/global
 * 
 * @param filters - Filtros opcionais (workspace, action, userId, datas)
 * @returns Logs paginados com informações completas
 */
export async function getAllActivityLogs(
  filters?: AdminActivityFilters
): Promise<AdminActivityLogsResponse> {
  await requireAdmin();

  const limit = Math.min(filters?.limit || 100, 100); // Máximo 100
  const offset = filters?.offset || 0;
  const page = Math.floor(offset / limit);

  // Construir where clause
  const where: any = {};
  
  // ⚠️ EXCEÇÃO: workspaceId é OPCIONAL para admin
  if (filters?.workspaceId) {
    where.workspaceId = filters.workspaceId;
  }
  
  if (filters?.action) {
    where.action = filters.action;
  }
  
  if (filters?.userId) {
    where.userId = filters.userId;
  }
  
  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) {
      where.createdAt.gte = filters.dateFrom;
    }
    if (filters.dateTo) {
      where.createdAt.lte = filters.dateTo;
    }
  }

  // Buscar logs e total
  const [logs, total] = await Promise.all([
    (prisma as any).auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        workspaceId: true,
        userId: true,
        userEmail: true,
        action: true,
        entityType: true,
        entityId: true,
        metadata: true,
        createdAt: true,
      },
    }),
    (prisma as any).auditLog.count({ where }),
  ]);

  // Buscar nomes dos workspaces
  const workspaceIds = [...new Set(logs.map((log: any) => log.workspaceId).filter(Boolean))];
  const workspaces = workspaceIds.length > 0
    ? await (prisma as any).workspace.findMany({
        where: { id: { in: workspaceIds } },
        select: { id: true, name: true },
      })
    : [];

  const workspaceMap = new Map(workspaces.map((w: any) => [w.id, w.name]));

  // Buscar nomes dos usuários
  const userIds = [...new Set(logs.map((log: any) => log.userId).filter(Boolean))];
  const users = userIds.length > 0
    ? await (prisma as any).user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      })
    : [];

  const userMap = new Map(users.map((u: any) => [u.id, u]));

  // Formatar logs
  const formattedLogs: AdminActivityLog[] = logs.map((log: any) => ({
    id: log.id,
    workspaceId: log.workspaceId,
    workspaceName: log.workspaceId ? workspaceMap.get(log.workspaceId) : undefined,
    userId: log.userId,
    userName: log.userId ? (userMap.get(log.userId) as { name?: string } | undefined)?.name : undefined,
    userEmail: log.userEmail || (log.userId ? (userMap.get(log.userId) as { email?: string } | undefined)?.email : undefined),
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    metadata: log.metadata,
    createdAt: log.createdAt,
  }));

  return {
    logs: formattedLogs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Lista activity logs de um workspace específico (Admin Global)
 * 
 * @param workspaceId - ID do workspace
 * @param limit - Limite de logs (padrão: 100)
 * @returns Logs do workspace
 */
export async function getActivityLogsByWorkspace(
  workspaceId: string,
  limit: number = 100
): Promise<AdminActivityLog[]> {
  await requireAdmin();

  if (!workspaceId) {
    throw new Error("workspaceId é obrigatório");
  }

  const logs = await (prisma as any).auditLog.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 100),
    select: {
      id: true,
      workspaceId: true,
      userId: true,
      userEmail: true,
      action: true,
      entityType: true,
      entityId: true,
      metadata: true,
      createdAt: true,
    },
  });

  // Buscar workspace name
  const workspace = await (prisma as any).workspace.findUnique({
    where: { id: workspaceId },
    select: { name: true },
  });

  // Buscar nomes dos usuários
  const userIds = [...new Set(logs.map((log: any) => log.userId).filter(Boolean))];
  const users = userIds.length > 0
    ? await (prisma as any).user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      })
    : [];

  const userMap = new Map(users.map((u: any) => [u.id, u]));

  return logs.map((log: any) => ({
    id: log.id,
    workspaceId: log.workspaceId,
    workspaceName: workspace?.name,
    userId: log.userId,
    userName: log.userId ? (userMap.get(log.userId) as { name?: string } | undefined)?.name : undefined,
    userEmail: log.userEmail || (log.userId ? (userMap.get(log.userId) as { email?: string } | undefined)?.email : undefined),
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    metadata: log.metadata,
    createdAt: log.createdAt,
  }));
}

/**
 * Obtém estatísticas globais de activity logs (Admin Global)
 * 
 * ⚠️ EXCEÇÃO MULTI-TENANT
 * Estatísticas agregadas de TODOS os workspaces
 * 
 * @returns Estatísticas globais
 */
export async function getActivityLogsStats(): Promise<AdminActivityStats> {
  await requireAdmin();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Buscar estatísticas em paralelo
  const [
    totalLogs,
    logsToday,
    logsThisWeek,
    logsThisMonth,
    logsByType,
    logsByDay,
    topWorkspaces,
  ] = await Promise.all([
    // Total de logs
    (prisma as any).auditLog.count(),
    
    // Logs hoje
    (prisma as any).auditLog.count({
      where: { createdAt: { gte: startOfToday } },
    }),
    
    // Logs esta semana
    (prisma as any).auditLog.count({
      where: { createdAt: { gte: startOfWeek } },
    }),
    
    // Logs este mês
    (prisma as any).auditLog.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
    
    // Logs por tipo
    (prisma as any).auditLog.groupBy({
      by: ['action'],
      _count: true,
      orderBy: { _count: { action: 'desc' } },
      take: 10,
    }),
    
    // Logs por dia (últimos 7 dias)
    (prisma as any).auditLog.groupBy({
      by: ['createdAt'],
      _count: true,
      where: { createdAt: { gte: startOfWeek } },
    }),
    
    // Top workspaces por atividade
    (prisma as any).auditLog.groupBy({
      by: ['workspaceId'],
      _count: true,
      where: { workspaceId: { not: null } },
      orderBy: { _count: { workspaceId: 'desc' } },
      take: 5,
    }),
  ]);

  // Processar logs por tipo
  const logsByTypeMap: Record<string, number> = {};
  logsByType.forEach((item: any) => {
    logsByTypeMap[item.action] = item._count;
  });

  // Processar logs por dia
  const logsByDayMap = new Map<string, number>();
  logsByDay.forEach((item: any) => {
    const date = new Date(item.createdAt).toISOString().split('T')[0];
    logsByDayMap.set(date, (logsByDayMap.get(date) || 0) + item._count);
  });

  const logsByDayArray = Array.from(logsByDayMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Buscar nomes dos workspaces
  const workspaceIds = topWorkspaces.map((item: any) => item.workspaceId).filter(Boolean);
  const workspaces = workspaceIds.length > 0
    ? await (prisma as any).workspace.findMany({
        where: { id: { in: workspaceIds } },
        select: { id: true, name: true },
      })
    : [];

  const workspaceMap = new Map(workspaces.map((w: any) => [w.id, w.name]));

  const topWorkspacesArray = topWorkspaces.map((item: any) => ({
    workspaceId: item.workspaceId,
    workspaceName: workspaceMap.get(item.workspaceId) || 'Desconhecido',
    count: item._count,
  }));

  return {
    totalLogs,
    logsToday,
    logsThisWeek,
    logsThisMonth,
    logsByType: logsByTypeMap,
    logsByDay: logsByDayArray,
    topWorkspaces: topWorkspacesArray,
  };
}

