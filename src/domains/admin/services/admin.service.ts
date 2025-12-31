import { prisma } from "~/lib/server/db";
import type {
  WorkspaceFilters,
  WorkspacesResponse,
  GlobalStats,
  WorkspaceDetails,
  WorkspaceCategory,
} from "../types";

/**
 * AdminService - Serviço para acesso administrativo global
 *
 * ⚠️ ATENÇÃO: Este service NUNCA filtra por workspaceId
 * Apenas usuários com GlobalUser.role = ADMIN podem usar este service
 */
export class AdminService {
  /**
   * Verifica se usuário é admin global
   */
  async isGlobalAdmin(userId: string): Promise<boolean> {
    const globalUser = await (prisma as any).globalUser.findUnique({
      where: { userId },
      select: { role: true, isActive: true },
    });

    return globalUser?.isActive === true && globalUser.role === "ADMIN";
  }

  /**
   * Verifica se usuário tem qualquer role global (ADMIN, SUPPORT, BILLING)
   */
  async hasGlobalAccess(userId: string): Promise<string | null> {
    const globalUser = await (prisma as any).globalUser.findUnique({
      where: { userId },
      select: { role: true, isActive: true },
    });

    if (!globalUser?.isActive) return null;
    return globalUser.role;
  }

  /**
   * Lista TODOS os workspaces (apenas para admin global)
   * ⚠️ Query SEM workspaceId - acessa TODOS os workspaces
   */
  async listAllWorkspaces(
    filters?: WorkspaceFilters
  ): Promise<WorkspacesResponse> {
    const page = filters?.page || 0;
    const limit = filters?.limit || 50;

    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.category) where.category = filters.category;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { slug: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [workspaces, total] = await Promise.all([
      (prisma as any).workspace.findMany({
        where,
        include: {
          _count: {
            select: {
              members: true,
              enterprises: true,
            },
          },
          subscription: {
            include: {
              plan: true,
            },
          },
          wallet: {
            select: {
              id: true,
              balance: true,
              currency: true,
            },
          },
          enterpriseMother: {
            select: {
              id: true,
              tradeName: true,
              document: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: page * limit,
      }),
      (prisma as any).workspace.count({ where }),
    ]);

    return {
      workspaces: workspaces as any,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtém detalhes completos de um workspace específico (admin view)
   * ⚠️ Query SEM validação de workspaceId - admin vê tudo
   */
  async getWorkspaceDetails(
    workspaceId: string
  ): Promise<WorkspaceDetails | null> {
    const workspace = await (prisma as any).workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { joinedAt: "desc" },
        },
        subscription: {
          include: {
            plan: true,
          },
        },
        wallet: {
          include: {
            transactions: {
              orderBy: { createdAt: "desc" },
              take: 10,
              select: {
                id: true,
                type: true,
                amount: true,
                description: true,
                createdAt: true,
              },
            },
          },
        },
        enterpriseMother: {
          select: {
            id: true,
            tradeName: true,
            document: true,
            segment: true,
          },
        },
        features: {
          include: {
            feature: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
          where: {
            enabled: true,
          },
        },
        _count: {
          select: {
            members: true,
            enterprises: true,
          },
        },
      },
    });

    if (!workspace) return null;

    return workspace as any;
  }

  /**
   * Obtém estatísticas globais (cross-workspace)
   * ⚠️ Queries SEM workspaceId - dados agregados de TODOS os workspaces
   */
  async getGlobalStats(): Promise<GlobalStats> {
    const [
      totalWorkspaces,
      activeWorkspaces,
      suspendedWorkspaces,
      archivedWorkspaces,
      totalUsers,
      workspacesByCategory,
      workspacesWithSubscription,
    ] = await Promise.all([
      // Totais
      (prisma as any).workspace.count(),
      (prisma as any).workspace.count({ where: { status: "ACTIVE" } }),
      (prisma as any).workspace.count({ where: { status: "SUSPENDED" } }),
      (prisma as any).workspace.count({ where: { status: "ARCHIVED" } }),
      prisma.user.count(),

      // Por categoria
      (prisma as any).workspace.groupBy({
        by: ["category"],
        _count: true,
      }),

      // Workspaces com subscription
      (prisma as any).subscription.findMany({
        include: {
          plan: true,
        },
      }),
    ]);

    // Total de membros (soma de todos os workspaces)
    const totalMembers = await (prisma as any).workspaceMember.count();

    // Agrupar por categoria
    const categoryMap: Record<WorkspaceCategory, number> = {
      DELIVERY: 0,
      AUTONOMO: 0,
      COMERCIO: 0,
      LOJA: 0,
      SERVICOS: 0,
      CONSTRUCAO: 0,
      LIVRE: 0,
    };

    workspacesByCategory.forEach((item: any) => {
      categoryMap[item.category as WorkspaceCategory] = item._count;
    });

    // Agrupar por plano
    const workspacesByPlan = {
      free: 0,
      pro: 0,
      enterprise: 0,
      none: 0,
    };

    workspacesWithSubscription.forEach((sub: any) => {
      const planCode = sub.plan.code.toLowerCase();
      if (planCode.includes("free")) workspacesByPlan.free++;
      else if (planCode.includes("pro")) workspacesByPlan.pro++;
      else if (planCode.includes("enterprise")) workspacesByPlan.enterprise++;
    });

    // Workspaces sem subscription
    const workspacesWithSubIds = workspacesWithSubscription.map(
      (s: any) => s.workspaceId
    );
    workspacesByPlan.none = totalWorkspaces - workspacesWithSubIds.length;

    return {
      totalWorkspaces,
      activeWorkspaces,
      suspendedWorkspaces,
      archivedWorkspaces,
      totalUsers,
      totalMembers,
      workspacesByCategory: categoryMap,
      workspacesByPlan,
    };
  }

  /**
   * Cria ou atualiza um GlobalUser
   * ⚠️ Apenas admins podem executar isso
   */
  async createOrUpdateGlobalUser(
    userId: string,
    role: string, // 'ADMIN' | 'SUPPORT' | 'BILLING'
    isActive: boolean = true
  ) {
    return (prisma as any).globalUser.upsert({
      where: { userId },
      create: {
        userId,
        role,
        isActive,
      },
      update: {
        role,
        isActive,
      },
    });
  }

  /**
   * Remove acesso global de um usuário
   */
  async removeGlobalUser(userId: string) {
    return (prisma as any).globalUser.delete({
      where: { userId },
    });
  }
}
