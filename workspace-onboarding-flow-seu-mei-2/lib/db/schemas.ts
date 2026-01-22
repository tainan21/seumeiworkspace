// ============================================
// DATABASE SCHEMAS - Referência para DDL
// Todas as tabelas necessárias para o onboarding/dashboard
// ============================================

/**
 * Workspace - Tabela principal
 */
export interface DBWorkspace {
  id: string // UUID, PK
  slug: string // UNIQUE, para URLs
  name: string // NOT NULL
  owner_id: string // FK users(id), NOT NULL
  created_by: string // FK users(id), NOT NULL
  theme: "minimal" | "corporate" | "playful" // ENUM
  top_bar_variant: "barTop-A" | "barTop-B" | "barTop-C" // ENUM
  billing_plan: "free" | "pro" | "enterprise" // ENUM
  locale: string // DEFAULT 'pt-BR'
  timezone: string // DEFAULT 'America/Sao_Paulo'
  created_at: string // TIMESTAMPTZ, DEFAULT NOW()
  updated_at: string // TIMESTAMPTZ, DEFAULT NOW()
  deleted_at: string | null // TIMESTAMPTZ, soft delete
}

/**
 * Workspace Brand - Logos e cores
 */
export interface DBWorkspaceBrand {
  id: string // UUID, PK
  workspace_id: string // FK workspaces(id), UNIQUE
  logo_url: string | null // TEXT
  primary_color: string // VARCHAR(7), ex: #123456
  accent_color: string // VARCHAR(7)
  created_at: string
  updated_at: string
}

/**
 * Workspace Company - Dados da empresa
 */
export interface DBWorkspaceCompany {
  id: string // UUID, PK
  workspace_id: string // FK workspaces(id), UNIQUE
  name: string // NOT NULL
  identifier_type: "CNPJ" | "CPF" | null // ENUM, NULLABLE
  identifier_value: string | null // VARCHAR(18), formatted
  company_type: "MEI" | "Simples" | "EIRELI" | "Ltda" | "SA" | "Startup" | null
  employee_count: number | null
  revenue_range: string | null
  created_at: string
  updated_at: string
}

/**
 * Workspace Apps - Apps habilitados no workspace
 */
export interface DBWorkspaceApp {
  id: string // UUID, PK
  workspace_id: string // FK workspaces(id)
  app_id: string // VARCHAR(50), ex: 'projects', 'docs'
  is_enabled: boolean // DEFAULT true
  installed_at: string
  // UNIQUE(workspace_id, app_id)
}

/**
 * Menu Items - Itens do menu lateral
 */
export interface DBMenuItem {
  id: string // UUID, PK
  workspace_id: string // FK workspaces(id)
  item_id: string // VARCHAR(50), ex: 'dashboard', 'projects'
  label: string // Display name
  icon: string // Icon name
  route: string // URL path
  parent_id: string | null // FK menu_items(id), para submenus
  order_index: number // Para ordenação
  is_visible: boolean // DEFAULT true
  created_at: string
  updated_at: string
  // INDEX(workspace_id, order_index)
}

/**
 * Templates - Templates pré-definidos (seed data)
 */
export interface DBTemplate {
  id: string // UUID, PK
  slug: string // UNIQUE
  name: string
  description: string
  thumbnail_url: string | null
  theme: "minimal" | "corporate" | "playful"
  top_bar_variant: "barTop-A" | "barTop-B" | "barTop-C"
  primary_color: string
  accent_color: string
  is_active: boolean // DEFAULT true
  created_at: string
  updated_at: string
}

/**
 * Template Features - Features suportadas por template
 */
export interface DBTemplateFeature {
  id: string // UUID, PK
  template_id: string // FK templates(id)
  feature_id: string // VARCHAR(50)
  is_required: boolean // DEFAULT false
  // UNIQUE(template_id, feature_id)
}

/**
 * Template Target Company Types - Tipos de empresa alvo
 */
export interface DBTemplateTargetCompany {
  id: string // UUID, PK
  template_id: string // FK templates(id)
  company_type: "MEI" | "Simples" | "EIRELI" | "Ltda" | "SA" | "Startup"
  // UNIQUE(template_id, company_type)
}

/**
 * Template Menu Presets - Menu padrão do template
 */
export interface DBTemplateMenuPreset {
  id: string // UUID, PK
  template_id: string // FK templates(id)
  item_id: string
  label: string
  icon: string
  order_index: number
}

/**
 * Roles - Papéis RBAC
 */
export interface DBRole {
  id: string // UUID, PK
  workspace_id: string // FK workspaces(id)
  slug: string // 'owner', 'admin', 'member', 'guest'
  name: string // Display name
  description: string | null
  is_default: boolean // DEFAULT false
  is_system: boolean // DEFAULT false, não pode ser deletado
  created_at: string
  updated_at: string
  // UNIQUE(workspace_id, slug)
}

/**
 * Role Permissions - Permissões por role
 */
export interface DBRolePermission {
  id: string // UUID, PK
  role_id: string // FK roles(id)
  resource: string // '*', 'workspace', 'projects', etc
  action: "create" | "read" | "update" | "delete" | "manage"
  scope: string // workspace_id para evitar ambiguidade
  // UNIQUE(role_id, resource, action)
}

/**
 * Workspace Members - Membros do workspace
 */
export interface DBWorkspaceMember {
  id: string // UUID, PK
  workspace_id: string // FK workspaces(id)
  user_id: string // FK users(id)
  role_id: string // FK roles(id)
  invited_by: string | null // FK users(id)
  invited_at: string | null
  joined_at: string | null
  status: "pending" | "active" | "suspended" // ENUM
  created_at: string
  updated_at: string
  // UNIQUE(workspace_id, user_id)
}

/**
 * Workspace Invites - Convites pendentes
 */
export interface DBWorkspaceInvite {
  id: string // UUID, PK
  workspace_id: string // FK workspaces(id)
  email: string // Email do convidado
  role_id: string // FK roles(id)
  invited_by: string // FK users(id)
  token: string // UNIQUE, para aceitar convite
  expires_at: string // TIMESTAMPTZ
  accepted_at: string | null
  created_at: string
  // INDEX(token)
}

/**
 * Subscriptions - Assinaturas/billing
 */
export interface DBSubscription {
  id: string // UUID, PK
  workspace_id: string // FK workspaces(id), UNIQUE
  plan: "free" | "pro" | "enterprise"
  status: "active" | "canceled" | "past_due" | "trialing"
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean // DEFAULT false
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

/**
 * Wallets - Carteira/créditos
 */
export interface DBWallet {
  id: string // UUID, PK
  workspace_id: string // FK workspaces(id), UNIQUE
  balance: number // DECIMAL(10,2), DEFAULT 0
  currency: string // DEFAULT 'BRL'
  created_at: string
  updated_at: string
}

/**
 * Onboarding Completions - Rastreamento de onboarding
 */
export interface DBOnboardingCompletion {
  id: string // UUID, PK
  workspace_id: string // FK workspaces(id), UNIQUE
  completed_at: string | null
  current_step: number // 1-8
  steps_data: Record<string, unknown> // JSONB, snapshot do estado
  created_at: string
  updated_at: string
}

/**
 * Features - Catálogo de features disponíveis (seed data)
 */
export interface DBFeature {
  id: string // UUID, PK
  slug: string // UNIQUE, 'projects', 'docs', etc
  name: string
  description: string
  icon: string
  category: string | null
  is_active: boolean // DEFAULT true
  created_at: string
}

/**
 * Component Layouts - Layouts de componentes UI
 */
export interface DBComponentLayout {
  id: string // UUID, PK
  slug: string // UNIQUE, 'barTop-A', 'barTop-B', etc
  name: string
  type: "topbar" | "sidebar" | "footer"
  config: Record<string, unknown> // JSONB
  is_active: boolean // DEFAULT true
  created_at: string
}

/**
 * User Settings - Configurações do usuário (não do workspace)
 */
export interface DBUserSettings {
  id: string // UUID, PK
  user_id: string // FK users(id), UNIQUE
  default_workspace_id: string | null // FK workspaces(id)
  ui_preferences: Record<string, unknown> // JSONB
  notification_preferences: Record<string, unknown> // JSONB
  created_at: string
  updated_at: string
}

// ============================================
// AGGREGATED TYPES (para API responses)
// ============================================

/**
 * Workspace completo com todas as relações
 */
export interface DBWorkspaceComplete {
  workspace: DBWorkspace
  brand: DBWorkspaceBrand | null
  company: DBWorkspaceCompany | null
  apps: DBWorkspaceApp[]
  menuItems: DBMenuItem[]
  roles: (DBRole & { permissions: DBRolePermission[] })[]
  subscription: DBSubscription | null
  onboarding: DBOnboardingCompletion | null
}
