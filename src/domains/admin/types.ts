/**
 * Enums (serão substituídos por @prisma/client após migração)
 */
export type WorkspaceStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";
export type WorkspaceCategory =
  | "DELIVERY"
  | "AUTONOMO"
  | "COMERCIO"
  | "LOJA"
  | "SERVICOS"
  | "CONSTRUCAO"
  | "LIVRE";
export type GlobalUserRole = "ADMIN" | "SUPPORT" | "BILLING";

/**
 * Filtros para listagem de workspaces (admin)
 */
export interface WorkspaceFilters {
  status?: WorkspaceStatus;
  category?: WorkspaceCategory;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Resposta paginada de workspaces
 */
export interface WorkspacesResponse {
  workspaces: WorkspaceWithDetails[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Workspace com detalhes para admin
 */
export interface WorkspaceWithDetails {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  category: WorkspaceCategory;
  status: WorkspaceStatus;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    members: number;
  };
  subscription: {
    id: string;
    status: string;
    plan: {
      id: string;
      code: string;
      name: string;
      price: number;
    };
  } | null;
  wallet: {
    id: string;
    balance: number;
    currency: string;
  } | null;
  enterpriseMother: {
    id: string;
    tradeName: string;
    document: string | null;
  } | null;
}

/**
 * Estatísticas globais
 */
export interface GlobalStats {
  totalWorkspaces: number;
  activeWorkspaces: number;
  suspendedWorkspaces: number;
  archivedWorkspaces: number;
  totalUsers: number;
  totalMembers: number;
  workspacesByCategory: Record<WorkspaceCategory, number>;
  workspacesByPlan: {
    free: number;
    pro: number;
    enterprise: number;
    none: number;
  };
}

/**
 * Detalhes completos de um workspace (admin view)
 */
export interface WorkspaceDetails {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  category: WorkspaceCategory;
  status: WorkspaceStatus;
  createdAt: Date;
  updatedAt: Date;
  members: Array<{
    id: string;
    role: string;
    isActive: boolean;
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
  }>;
  subscription: {
    id: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    plan: {
      id: string;
      code: string;
      name: string;
      price: number;
    };
  } | null;
  wallet: {
    id: string;
    balance: number;
    reservedBalance: number;
    currency: string;
    transactions: Array<{
      id: string;
      type: string;
      amount: number;
      description: string;
      createdAt: Date;
    }>;
  } | null;
  enterpriseMother: {
    id: string;
    tradeName: string;
    document: string | null;
    segment: string;
  } | null;
  features: Array<{
    id: string;
    enabled: boolean;
    expiresAt: Date | null;
    feature: {
      id: string;
      code: string;
      name: string;
    };
  }>;
  _count: {
    members: number;
    enterprises: number;
  };
}
