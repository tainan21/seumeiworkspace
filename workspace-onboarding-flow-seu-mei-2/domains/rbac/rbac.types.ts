import type { Permission, Role, RBACConfig, PermissionAction } from "@/types/workspace"

export type { Permission, Role, RBACConfig, PermissionAction }

export interface GenerateRBACInput {
  workspaceId: string
  ownerId: string
  apps: string[]
}

export type AnalyticsPermissionAction = "view" | "export" | "configure"

export interface AnalyticsPermission {
  resource: "analytics"
  actions: AnalyticsPermissionAction[]
  scope: string
}

export interface RBACConfigWithAnalytics extends RBACConfig {
  analyticsPermissions?: Record<string, AnalyticsPermission>
}
