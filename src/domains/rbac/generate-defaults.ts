import { WorkspaceRole } from "@prisma/client";

/**
 * Permissão granular
 */
export interface Permission {
  resource: string;
  actions: ("create" | "read" | "update" | "delete" | "manage")[];
}

/**
 * Role com suas permissões
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isDefault?: boolean;
  isSystem?: boolean;
}

/**
 * Configuração RBAC completa
 */
export interface RBACConfig {
  roles: Role[];
  defaultRole: string;
}

/**
 * Gera configuração RBAC padrão para um workspace
 * 
 * Cria 4 roles padrão:
 * - Owner: Acesso total (manage em tudo)
 * - Admin: Quase tudo, exceto billing e delete workspace
 * - Member: CRUD nos apps, sem admin
 * - Guest: Somente leitura
 * 
 * @param workspace - Configuração do workspace
 * @returns RBACConfig com roles e permissões
 */
export function generateRBACDefaults(workspace: {
  ownerId: string;
  apps: string[];
}): RBACConfig {
  const { apps } = workspace;

  // Owner: acesso total
  const ownerPermissions: Permission[] = [
    { resource: "*", actions: ["manage"] },
    { resource: "workspace", actions: ["manage"] },
    { resource: "billing", actions: ["manage"] },
    { resource: "members", actions: ["manage"] },
    ...apps.map((app) => ({
      resource: app,
      actions: ["manage"] as ("create" | "update" | "delete" | "read" | "manage")[],
    })),
  ];

  // Admin: quase tudo, exceto billing e delete workspace
  const adminPermissions: Permission[] = [
    { resource: "members", actions: ["create", "read", "update"] },
    { resource: "settings", actions: ["read", "update"] },
    { resource: "workspace", actions: ["read", "update"] },
    ...apps.map((app) => ({
      resource: app,
      actions: ["create", "read", "update", "delete"] as ("create" | "update" | "delete" | "read" | "manage")[],
    })),
  ];

  // Member: CRUD nos apps, sem admin
  const memberPermissions: Permission[] = apps.map((app) => ({
    resource: app,
    actions: ["create", "read", "update"] as const,
  }));

  // Guest: somente leitura
  const guestPermissions: Permission[] = apps.map((app) => ({
    resource: app,
    actions: ["read"] as const,
  }));

  const roles: Role[] = [
    {
      id: "owner",
      name: "Proprietário",
      description: "Acesso total ao workspace",
      permissions: ownerPermissions,
      isSystem: true,
    },
    {
      id: "admin",
      name: "Administrador",
      description: "Gerencia membros e configurações",
      permissions: adminPermissions,
      isSystem: true,
    },
    {
      id: "member",
      name: "Membro",
      description: "Acesso padrão aos apps",
      permissions: memberPermissions,
      isDefault: true,
      isSystem: true,
    },
    {
      id: "guest",
      name: "Convidado",
      description: "Acesso somente leitura",
      permissions: guestPermissions,
      isSystem: true,
    },
  ];

  return {
    roles,
    defaultRole: "member",
  };
}

/**
 * Verifica se um role tem permissão para uma ação em um recurso
 */
export function hasPermission(
  role: Role,
  resource: string,
  action: "create" | "read" | "update" | "delete" | "manage"
): boolean {
  // Owner sempre tem acesso (resource: "*")
  const ownerPerm = role.permissions.find((p) => p.resource === "*");
  if (ownerPerm && ownerPerm.actions.includes("manage")) {
    return true;
  }

  // Verificar permissão específica
  const perm = role.permissions.find((p) => p.resource === resource);
  if (!perm) {
    return false;
  }

  // "manage" inclui todas as ações
  if (perm.actions.includes("manage")) {
    return true;
  }

  return perm.actions.includes(action);
}

/**
 * Mapeia WorkspaceRole do Prisma para Role do RBAC
 */
export function mapWorkspaceRoleToRBACRole(
  workspaceRole: WorkspaceRole
): string {
  const mapping: Record<WorkspaceRole, string> = {
    OWNER: "owner",
    ADMIN: "admin",
    MANAGER: "member",
    OPERATOR: "member",
    VIEWER: "guest",
  };

  return mapping[workspaceRole] || "guest";
}
