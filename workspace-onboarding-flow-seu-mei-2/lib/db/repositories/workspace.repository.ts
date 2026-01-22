// ============================================
// REPOSITORY: Workspace
// Abstração de acesso a dados
// ============================================

import { getDbClient, type DatabaseClient } from "../client"
import type {
  DBWorkspace,
  DBWorkspaceBrand,
  DBWorkspaceCompany,
  DBWorkspaceApp,
  DBMenuItem,
  DBRole,
  DBRolePermission,
  DBWorkspaceComplete,
} from "../schemas"
import type { Workspace, MenuItem, Role, Permission } from "@/types/workspace"

// ============================================
// CREATE
// ============================================

export interface CreateWorkspaceData {
  slug: string
  name: string
  ownerId: string
  createdBy: string
  theme: string
  topBarVariant: string
  billingPlan: string
  brand: {
    logoUrl?: string
    primaryColor: string
    accentColor: string
  }
  company: {
    name: string
    identifierType?: string
    identifierValue?: string
    companyType?: string
    employeeCount?: number
    revenueRange?: string
  }
  apps: string[]
  menuItems: MenuItem[]
  rbac: {
    roles: Role[]
    defaultRole: string
  }
}

export async function createWorkspaceInDb(data: CreateWorkspaceData, client?: DatabaseClient): Promise<DBWorkspace> {
  const db = client || getDbClient()

  // Usar transação para garantir consistência
  return db.transaction(async (tx) => {
    // 1. Criar workspace
    const [workspace] = await tx.query<DBWorkspace>(
      `
      INSERT INTO workspaces (slug, name, owner_id, created_by, theme, top_bar_variant, billing_plan)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
      [data.slug, data.name, data.ownerId, data.createdBy, data.theme, data.topBarVariant, data.billingPlan],
    )

    const workspaceId = workspace.id

    // 2. Criar brand
    await tx.execute(
      `
      INSERT INTO workspace_brands (workspace_id, logo_url, primary_color, accent_color)
      VALUES ($1, $2, $3, $4)
    `,
      [workspaceId, data.brand.logoUrl || null, data.brand.primaryColor, data.brand.accentColor],
    )

    // 3. Criar company
    await tx.execute(
      `
      INSERT INTO workspace_companies (workspace_id, name, identifier_type, identifier_value, company_type, employee_count, revenue_range)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
      [
        workspaceId,
        data.company.name,
        data.company.identifierType || null,
        data.company.identifierValue || null,
        data.company.companyType || null,
        data.company.employeeCount || null,
        data.company.revenueRange || null,
      ],
    )

    // 4. Criar apps
    for (const appId of data.apps) {
      await tx.execute(
        `
        INSERT INTO workspace_apps (workspace_id, app_id)
        VALUES ($1, $2)
      `,
        [workspaceId, appId],
      )
    }

    // 5. Criar menu items
    for (const item of data.menuItems) {
      await tx.execute(
        `
        INSERT INTO menu_items (workspace_id, item_id, label, icon, route, order_index)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
        [workspaceId, item.id, item.label, item.icon, item.route, item.order],
      )
    }

    // 6. Criar roles
    const roleIdMap: Record<string, string> = {}
    for (const role of data.rbac.roles) {
      const [dbRole] = await tx.query<DBRole>(
        `
        INSERT INTO roles (workspace_id, slug, name, description, is_default, is_system)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
        [workspaceId, role.id, role.name, role.description, role.isDefault || false, role.isSystem || false],
      )
      roleIdMap[role.id] = dbRole.id

      // 7. Criar permissions para cada role
      for (const perm of role.permissions) {
        for (const action of perm.actions) {
          await tx.execute(
            `
            INSERT INTO role_permissions (role_id, resource, action, scope)
            VALUES ($1, $2, $3, $4)
          `,
            [dbRole.id, perm.resource, action, workspaceId],
          )
        }
      }
    }

    // 8. Adicionar owner como member
    const ownerRoleId = roleIdMap["owner"]
    if (ownerRoleId) {
      await tx.execute(
        `
        INSERT INTO workspace_members (workspace_id, user_id, role_id, status, joined_at)
        VALUES ($1, $2, $3, 'active', NOW())
      `,
        [workspaceId, data.ownerId, ownerRoleId],
      )
    }

    // 9. Criar subscription padrão
    await tx.execute(
      `
      INSERT INTO subscriptions (workspace_id, plan, status)
      VALUES ($1, $2, 'active')
    `,
      [workspaceId, data.billingPlan],
    )

    // 10. Criar wallet
    await tx.execute(
      `
      INSERT INTO wallets (workspace_id, balance)
      VALUES ($1, 0)
    `,
      [workspaceId],
    )

    // 11. Marcar onboarding como completo
    await tx.execute(
      `
      INSERT INTO onboarding_completions (workspace_id, completed_at, current_step)
      VALUES ($1, NOW(), 8)
    `,
      [workspaceId],
    )

    return workspace
  })
}

// ============================================
// READ
// ============================================

export async function findWorkspaceById(
  workspaceId: string,
  client?: DatabaseClient,
): Promise<DBWorkspaceComplete | null> {
  const db = client || getDbClient()

  const workspace = await db.queryOne<DBWorkspace>(
    `
    SELECT * FROM workspaces WHERE id = $1 AND deleted_at IS NULL
  `,
    [workspaceId],
  )

  if (!workspace) return null

  const [brand, company, apps, menuItems, roles, subscription, onboarding] = await Promise.all([
    db.queryOne<DBWorkspaceBrand>(`SELECT * FROM workspace_brands WHERE workspace_id = $1`, [workspaceId]),
    db.queryOne<DBWorkspaceCompany>(`SELECT * FROM workspace_companies WHERE workspace_id = $1`, [workspaceId]),
    db.query<DBWorkspaceApp>(`SELECT * FROM workspace_apps WHERE workspace_id = $1`, [workspaceId]),
    db.query<DBMenuItem>(`SELECT * FROM menu_items WHERE workspace_id = $1 ORDER BY order_index`, [workspaceId]),
    db.query<DBRole>(`SELECT * FROM roles WHERE workspace_id = $1`, [workspaceId]),
    db.queryOne(`SELECT * FROM subscriptions WHERE workspace_id = $1`, [workspaceId]),
    db.queryOne(`SELECT * FROM onboarding_completions WHERE workspace_id = $1`, [workspaceId]),
  ])

  // Buscar permissions para cada role
  const rolesWithPermissions = await Promise.all(
    roles.map(async (role) => {
      const permissions = await db.query<DBRolePermission>(`SELECT * FROM role_permissions WHERE role_id = $1`, [
        role.id,
      ])
      return { ...role, permissions }
    }),
  )

  return {
    workspace,
    brand,
    company,
    apps,
    menuItems,
    roles: rolesWithPermissions,
    subscription,
    onboarding,
  } as DBWorkspaceComplete
}

export async function findWorkspacesByOwnerId(ownerId: string, client?: DatabaseClient): Promise<DBWorkspace[]> {
  const db = client || getDbClient()

  return db.query<DBWorkspace>(
    `
    SELECT * FROM workspaces 
    WHERE (owner_id = $1 OR created_by = $1) AND deleted_at IS NULL
    ORDER BY created_at DESC
  `,
    [ownerId],
  )
}

export async function findWorkspaceBySlug(slug: string, client?: DatabaseClient): Promise<DBWorkspace | null> {
  const db = client || getDbClient()

  return db.queryOne<DBWorkspace>(
    `
    SELECT * FROM workspaces WHERE slug = $1 AND deleted_at IS NULL
  `,
    [slug],
  )
}

// ============================================
// TRANSFORM: DB -> Domain
// ============================================

export function transformDbToWorkspace(dbData: DBWorkspaceComplete): Workspace {
  const { workspace, brand, company, apps, menuItems, roles } = dbData

  return {
    workspaceId: workspace.id,
    slug: workspace.slug,
    name: workspace.name,
    brand: {
      logo: brand?.logo_url || undefined,
      colors: {
        primary: brand?.primary_color || "#18181B",
        accent: brand?.accent_color || "#3B82F6",
      },
    },
    company: {
      name: company?.name || workspace.name,
      identifier: company?.identifier_type
        ? {
            type: company.identifier_type as "CNPJ" | "CPF",
            value: company.identifier_value || "",
          }
        : undefined,
    },
    apps: apps.filter((a) => a.is_enabled).map((a) => a.app_id),
    menuItems: menuItems.map((m) => ({
      id: m.item_id,
      label: m.label,
      icon: m.icon,
      order: m.order_index,
      parentId: m.parent_id || undefined,
      route: m.route,
    })),
    topBarVariant: workspace.top_bar_variant as "barTop-A" | "barTop-B" | "barTop-C",
    theme: workspace.theme as "minimal" | "corporate" | "playful",
    ownerId: workspace.owner_id,
    createdBy: workspace.created_by,
    settings: {
      billingPlan: workspace.billing_plan as "free" | "pro" | "enterprise",
      locale: workspace.locale,
      timezone: workspace.timezone,
    },
    rbac: {
      roles: roles.map((r) => ({
        id: r.slug,
        name: r.name,
        description: r.description || "",
        permissions: groupPermissions(r.permissions, workspace.id),
        isDefault: r.is_default,
        isSystem: r.is_system,
      })),
      defaultRole: roles.find((r) => r.is_default)?.slug || "member",
    },
    createdAt: workspace.created_at,
    updatedAt: workspace.updated_at,
  }
}

function groupPermissions(permissions: DBRolePermission[], workspaceId: string): Permission[] {
  const grouped: Record<string, Permission> = {}

  for (const p of permissions) {
    if (!grouped[p.resource]) {
      grouped[p.resource] = {
        resource: p.resource,
        actions: [],
        scope: workspaceId,
      }
    }
    if (!grouped[p.resource].actions.includes(p.action as any)) {
      grouped[p.resource].actions.push(p.action as any)
    }
  }

  return Object.values(grouped)
}
