// ============================================
// DOMAIN: RBAC
// Geração de roles e permissões padrão
// ============================================

import type {
  Permission,
  Role,
  RBACConfig,
  GenerateRBACInput,
  AnalyticsPermission,
  AnalyticsPermissionAction,
} from "./rbac.types"

/**
 * Gera configuração RBAC padrão para novo workspace
 * - Inclui scope: workspaceId em cada permission
 * - Cria 4 roles padrão: Owner, Admin, Member, Guest
 */
export function generateRBACDefaults(input: GenerateRBACInput): RBACConfig {
  const { workspaceId, apps } = input

  // Owner: acesso total
  const ownerPermissions: Permission[] = [
    { resource: "*", actions: ["manage"], scope: workspaceId },
    { resource: "workspace", actions: ["manage"], scope: workspaceId },
    { resource: "billing", actions: ["manage"], scope: workspaceId },
    { resource: "members", actions: ["manage"], scope: workspaceId },
  ]

  // Admin: quase tudo, exceto billing e delete workspace
  const adminPermissions: Permission[] = [
    { resource: "members", actions: ["create", "read", "update"], scope: workspaceId },
    { resource: "settings", actions: ["read", "update"], scope: workspaceId },
    ...apps.map((app) => ({
      resource: app,
      actions: ["create", "read", "update", "delete"] as const,
      scope: workspaceId,
    })),
  ]

  // Member: CRUD nos apps, sem admin
  const memberPermissions: Permission[] = apps.map((app) => ({
    resource: app,
    actions: ["create", "read", "update"] as const,
    scope: workspaceId,
  }))

  // Guest: somente leitura
  const guestPermissions: Permission[] = apps.map((app) => ({
    resource: app,
    actions: ["read"] as const,
    scope: workspaceId,
  }))

  const roles: Role[] = [
    {
      id: "owner",
      name: "Proprietário",
      description: "Acesso total ao workspace, incluindo billing e exclusão",
      permissions: ownerPermissions,
      isSystem: true,
    },
    {
      id: "admin",
      name: "Administrador",
      description: "Gerencia membros e configurações, sem acesso a billing",
      permissions: adminPermissions,
      isSystem: true,
    },
    {
      id: "member",
      name: "Membro",
      description: "Acesso padrão aos apps do workspace",
      permissions: memberPermissions,
      isDefault: true,
      isSystem: true,
    },
    {
      id: "guest",
      name: "Convidado",
      description: "Acesso somente leitura aos apps",
      permissions: guestPermissions,
      isSystem: true,
    },
  ]

  return {
    roles,
    defaultRole: "member",
  }
}

/**
 * Verifica se usuário tem permissão específica
 */
export function hasPermission(userRole: Role, resource: string, action: string, workspaceId: string): boolean {
  return userRole.permissions.some((perm) => {
    const resourceMatch = perm.resource === "*" || perm.resource === resource
    const actionMatch = perm.actions.includes("manage") || perm.actions.includes(action as any)
    const scopeMatch = perm.scope === workspaceId

    return resourceMatch && actionMatch && scopeMatch
  })
}

// Gera permissões de analytics para um role específico
// - Owner e Admin: acesso total (view, export, configure)
// - Member: view e export
// - Guest: apenas view
export function generateAnalyticsPermissions(roleId: string, workspaceId: string): AnalyticsPermission {
  const permissionsByRole: Record<string, AnalyticsPermissionAction[]> = {
    owner: ["view", "export", "configure"],
    admin: ["view", "export", "configure"],
    member: ["view", "export"],
    guest: ["view"],
  }

  return {
    resource: "analytics",
    actions: permissionsByRole[roleId] || ["view"],
    scope: workspaceId,
  }
}

/**
 * Verifica se usuário tem permissão específica de analytics
 */
export function hasAnalyticsPermission(
  userRole: Role,
  action: AnalyticsPermissionAction,
  workspaceId: string,
  analyticsPermission?: AnalyticsPermission,
): boolean {
  // Se não há permissão de analytics definida, verificar pelo role padrão
  if (!analyticsPermission) {
    const defaultPermission = generateAnalyticsPermissions(userRole.id, workspaceId)
    return defaultPermission.actions.includes(action) && defaultPermission.scope === workspaceId
  }

  return analyticsPermission.actions.includes(action) && analyticsPermission.scope === workspaceId
}

/**
 * Gera configuração RBAC completa incluindo analytics
 */
export function generateRBACWithAnalytics(input: GenerateRBACInput): RBACConfig & {
  analyticsPermissions: Record<string, AnalyticsPermission>
} {
  const baseRbac = generateRBACDefaults(input)

  const analyticsPermissions: Record<string, AnalyticsPermission> = {}
  baseRbac.roles.forEach((role) => {
    analyticsPermissions[role.id] = generateAnalyticsPermissions(role.id, input.workspaceId)
  })

  return {
    ...baseRbac,
    analyticsPermissions,
  }
}

// ============================================
// TESTES
// ============================================
/*
TEST: generateRBACDefaults - Inclui scope em todas permissions
INPUT: { workspaceId: 'ws_123', ownerId: 'user_1', apps: ['projects'] }
EXPECTED: Todas permissions têm scope: 'ws_123'

TEST: generateRBACDefaults - 4 roles padrão
INPUT: (validInput)
EXPECTED: roles.length === 4, roles contém owner, admin, member, guest

TEST: generateRBACDefaults - Member é default
INPUT: (validInput)
EXPECTED: defaultRole === 'member'

TEST: hasPermission - Owner pode tudo
INPUT: (ownerRole, 'billing', 'manage', 'ws_123')
EXPECTED: true

TEST: hasPermission - Guest só lê
INPUT: (guestRole, 'projects', 'create', 'ws_123')
EXPECTED: false

TEST: generateAnalyticsPermissions - Owner tem acesso total
INPUT: ('owner', 'ws_123')
EXPECTED: { resource: 'analytics', actions: ['view', 'export', 'configure'], scope: 'ws_123' }

TEST: generateAnalyticsPermissions - Guest tem apenas view
INPUT: ('guest', 'ws_123')
EXPECTED: { resource: 'analytics', actions: ['view'], scope: 'ws_123' }

TEST: generateRBACWithAnalytics - Inclui analyticsPermissions
INPUT: { workspaceId: 'ws_123', ownerId: 'user_1', apps: ['projects'] }
EXPECTED: { roles: [...], defaultRole: 'member', analyticsPermissions: { owner: {...}, admin: {...}, member: {...}, guest: {...} } }
*/
