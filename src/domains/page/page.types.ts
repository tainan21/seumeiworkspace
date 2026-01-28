// ============================================
// PAGE TYPES - Tipos para gerenciamento de páginas
// ============================================

/**
 * Status de visibilidade da página
 */
export type PageVisibility = "public" | "private" | "draft"

/**
 * Tipo de layout da página
 */
export type PageLayout = "default" | "full-width" | "sidebar-left" | "sidebar-right" | "dashboard"

/**
 * Configuração da página
 */
export interface PageConfig {
  id: string
  workspaceId: string
  slug: string // URL slug único por workspace
  title: string
  description?: string
  content?: string | Record<string, unknown> // String ou structured content (JSON)
  visibility: PageVisibility
  layout: PageLayout
  parentId?: string // Para hierarquia de páginas
  order: number // Ordem dentro do parent
  icon?: string
  customMeta?: {
    keywords?: string[]
    ogImage?: string
    customCSS?: string
    customJS?: string
  }
  permissions?: {
    canView: string[] // role IDs
    canEdit: string[] // role IDs
  }
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  deletedAt?: string
}

/**
 * Entrada para criar nova página
 */
export interface CreatePageInput {
  workspaceId: string
  slug: string
  title: string
  description?: string
  content?: string | Record<string, unknown>
  visibility?: PageVisibility
  layout?: PageLayout
  parentId?: string
  icon?: string
  customMeta?: PageConfig["customMeta"]
  permissions?: PageConfig["permissions"]
  createdBy: string
}

/**
 * Entrada para atualizar página existente
 */
export interface UpdatePageInput {
  title?: string
  description?: string
  content?: string | Record<string, unknown>
  visibility?: PageVisibility
  layout?: PageLayout
  parentId?: string
  icon?: string
  order?: number
  customMeta?: PageConfig["customMeta"]
  permissions?: PageConfig["permissions"]
  updatedBy: string
}

/**
 * Validação de página
 */
export interface PageValidationError {
  field: string
  message: string
  code: string
}

export interface PageValidationResult {
  valid: boolean
  errors: PageValidationError[]
  warnings: PageValidationError[]
}

/**
 * Resultado de operações
 */
export type PageOperationResult =
  | { success: true; page: PageConfig }
  | { success: false; errors: PageValidationError[] }

/**
 * Schema de banco de dados
 */
export interface DBPage {
  id: string
  workspace_id: string
  slug: string
  title: string
  description: string | null
  content: string | Record<string, unknown> | null
  visibility: PageVisibility
  layout: PageLayout
  parent_id: string | null
  order_index: number
  icon: string | null
  custom_meta: Record<string, unknown> | null
  permissions: Record<string, unknown> | null
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
  published_at: string | null
  deleted_at: string | null
}

/**
 * Hierarquia de páginas (para menu, breadcrumbs)
 */
export interface PageHierarchy {
  page: PageConfig
  children: PageHierarchy[]
  level: number
  path: string[] // Array de slugs desde a raiz
}

/**
 * Filtros para busca de páginas
 */
export interface PageFilters {
  workspaceId: string
  visibility?: PageVisibility
  parentId?: string | null
  searchQuery?: string
  includeDeleted?: boolean
}
