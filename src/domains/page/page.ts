// ============================================
// DOMAIN: Page
// Gerenciamento de páginas do sistema
// ============================================

import type {
  PageConfig,
  CreatePageInput,
  UpdatePageInput,
  PageOperationResult,
  PageValidationResult,
  PageValidationError,
  PageHierarchy,
  PageFilters,
  DBPage,
} from "./page.types"
import type { TrackPageViewInput, TrackingResult } from "@/types/analytics"
import type { Workspace } from "@/types/workspace"
import { isTrackingEnabled } from "@/domains/workspace/workspace"

// ============================================
// VALIDAÇÕES
// ============================================

/**
 * Valida slug da página
 * - Apenas letras minúsculas, números e hífens
 * - Não pode começar ou terminar com hífen
 * - Não pode ter hífens consecutivos
 */
export function validateSlug(slug: string): { valid: boolean; errors: string[]; normalized?: string } {
  const errors: string[] = []

  if (!slug || slug.trim() === "") {
    errors.push("Slug é obrigatório")
    return { valid: false, errors }
  }

  // Normalizar: lowercase, remover acentos, espaços -> hífens
  const normalized = slug
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/-{2,}/g, "-")

  // Validar formato
  const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/

  if (!slugRegex.test(normalized)) {
    errors.push("Slug inválido. Use apenas letras minúsculas, números e hífens")
  }

  // Verificar slugs reservados do sistema
  const reservedSlugs = [
    "api",
    "admin",
    "dashboard",
    "settings",
    "auth",
    "login",
    "logout",
    "signup",
    "workspace",
    "onboarding",
  ]

  if (reservedSlugs.includes(normalized)) {
    errors.push(`Slug '${normalized}' é reservado pelo sistema`)
  }

  // Tamanho
  if (normalized.length < 2) {
    errors.push("Slug deve ter no mínimo 2 caracteres")
  }

  if (normalized.length > 100) {
    errors.push("Slug deve ter no máximo 100 caracteres")
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true, errors, normalized }
}

/**
 * Valida título da página
 */
export function validateTitle(title: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!title || title.trim() === "") {
    errors.push("Título é obrigatório")
    return { valid: false, errors }
  }

  if (title.trim().length < 3) {
    errors.push("Título deve ter no mínimo 3 caracteres")
  }

  if (title.trim().length > 200) {
    errors.push("Título deve ter no máximo 200 caracteres")
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Valida input de criação de página
 */
export function validateCreatePageInput(input: CreatePageInput): PageValidationResult {
  const errors: PageValidationError[] = []
  const warnings: PageValidationError[] = []

  // Validar workspaceId
  if (!input.workspaceId) {
    errors.push({
      field: "workspaceId",
      message: "Workspace ID é obrigatório",
      code: "MISSING_REQUIRED",
    })
  }

  // Validar slug
  const slugValidation = validateSlug(input.slug)
  if (!slugValidation.valid) {
    errors.push({
      field: "slug",
      message: slugValidation.errors.join("; "),
      code: "INVALID_SLUG",
    })
  }

  // Validar título
  const titleValidation = validateTitle(input.title)
  if (!titleValidation.valid) {
    errors.push({
      field: "title",
      message: titleValidation.errors.join("; "),
      code: "INVALID_TITLE",
    })
  }

  // Validar createdBy
  if (!input.createdBy) {
    errors.push({
      field: "createdBy",
      message: "Criador da página é obrigatório",
      code: "MISSING_REQUIRED",
    })
  }

  // Warnings
  if (!input.description) {
    warnings.push({
      field: "description",
      message: "Recomendamos adicionar uma descrição para melhor SEO",
      code: "MISSING_OPTIONAL",
    })
  }

  if (input.visibility === "public" && !input.content) {
    warnings.push({
      field: "content",
      message: "Página pública sem conteúdo",
      code: "EMPTY_CONTENT",
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Valida input de atualização
 */
export function validateUpdatePageInput(input: UpdatePageInput): PageValidationResult {
  const errors: PageValidationError[] = []
  const warnings: PageValidationError[] = []

  // Validar título se fornecido
  if (input.title !== undefined) {
    const titleValidation = validateTitle(input.title)
    if (!titleValidation.valid) {
      errors.push({
        field: "title",
        message: titleValidation.errors.join("; "),
        code: "INVALID_TITLE",
      })
    }
  }

  // Validar updatedBy
  if (!input.updatedBy) {
    errors.push({
      field: "updatedBy",
      message: "Atualizador da página é obrigatório",
      code: "MISSING_REQUIRED",
    })
  }

  // Validar ordem
  if (input.order !== undefined && (input.order < 0 || input.order > 9999)) {
    errors.push({
      field: "order",
      message: "Ordem deve estar entre 0 e 9999",
      code: "INVALID_ORDER",
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

// ============================================
// REGRAS DE NEGÓCIO
// ============================================

/**
 * Verifica se slug está disponível no workspace
 * (deve ser único por workspace, excluindo soft-deleted)
 */
export function isSlugAvailable(slug: string, workspaceId: string, existingPages: PageConfig[]): boolean {
  return !existingPages.some((p) => p.workspaceId === workspaceId && p.slug === slug && !p.deletedAt)
}

/**
 * Verifica se usuário pode visualizar página
 */
export function canUserViewPage(page: PageConfig, userRoles: string[]): boolean {
  // Página pública: todos podem ver
  if (page.visibility === "public") {
    return true
  }

  // Página draft: apenas quem criou ou tem permissão edit
  if (page.visibility === "draft") {
    if (!page.permissions?.canEdit) return false
    return userRoles.some((role) => page.permissions!.canEdit.includes(role))
  }

  // Página privada: verificar permissões
  if (page.permissions?.canView) {
    return userRoles.some((role) => page.permissions!.canView!.includes(role))
  }

  // Se não tem permissões definidas, apenas owner/admin podem ver
  return userRoles.includes("owner") || userRoles.includes("admin")
}

/**
 * Verifica se usuário pode editar página
 */
export function canUserEditPage(page: PageConfig, userRoles: string[]): boolean {
  // Owner e admin sempre podem editar
  if (userRoles.includes("owner") || userRoles.includes("admin")) {
    return true
  }

  // Verificar permissões
  if (page.permissions?.canEdit) {
    return userRoles.some((role) => page.permissions!.canEdit!.includes(role))
  }

  return false
}

/**
 * Calcula próxima ordem disponível para página no parent
 */
export function calculateNextOrder(
  workspaceId: string,
  parentId: string | undefined,
  existingPages: PageConfig[],
): number {
  const siblings = existingPages.filter((p) => p.workspaceId === workspaceId && p.parentId === parentId && !p.deletedAt)

  if (siblings.length === 0) return 0

  const maxOrder = Math.max(...siblings.map((p) => p.order))
  return maxOrder + 1
}

/**
 * Valida hierarquia (previne loops infinitos)
 */
export function validatePageHierarchy(
  pageId: string,
  newParentId: string | undefined,
  allPages: PageConfig[],
): { valid: boolean; error?: string } {
  if (!newParentId) return { valid: true }

  // Não pode ser pai de si mesmo
  if (pageId === newParentId) {
    return { valid: false, error: "Página não pode ser pai de si mesma" }
  }

  // Verificar se newParent existe
  const newParent = allPages.find((p) => p.id === newParentId && !p.deletedAt)
  if (!newParent) {
    return { valid: false, error: "Página pai não encontrada" }
  }

  // Verificar se newParent não é filho/descendente de pageId
  const isDescendant = (parentId: string, checkId: string): boolean => {
    const parent = allPages.find((p) => p.id === parentId)
    if (!parent) return false
    if (parent.parentId === checkId) return true
    if (parent.parentId) return isDescendant(parent.parentId, checkId)
    return false
  }

  if (isDescendant(newParentId, pageId)) {
    return { valid: false, error: "Hierarquia circular detectada" }
  }

  // Limitar profundidade (máximo 5 níveis)
  const getDepth = (pid: string): number => {
    const p = allPages.find((page) => page.id === pid)
    if (!p || !p.parentId) return 1
    return 1 + getDepth(p.parentId)
  }

  const newDepth = getDepth(newParentId) + 1
  if (newDepth > 5) {
    return { valid: false, error: "Hierarquia máxima de 5 níveis excedida" }
  }

  return { valid: true }
}

// ============================================
// PAGE VIEW TRACKING
// ============================================

let pageViewBuffer: TrackPageViewInput[] = []
const PAGE_VIEW_BUFFER_SIZE = 10
const PAGE_VIEW_FLUSH_INTERVAL = 5000 // 5 seconds

/**
 * Emite evento de page view para o sistema de analytics
 * Esta função é chamada pelo page domain quando uma página é visualizada
 *
 * Comportamento:
 * - Verifica se tracking está habilitado no workspace
 * - Adiciona evento ao buffer para batching
 * - Retorna imediatamente (non-blocking)
 *
 * Nota: A persistência real será implementada pela camada de infraestrutura
 * quando o schema de analytics for aplicado ao banco de dados
 */
export function emitPageViewEvent(workspace: Workspace, input: TrackPageViewInput): TrackingResult {
  // Verificar se tracking está habilitado
  if (!isTrackingEnabled(workspace, "pageViews")) {
    return { success: false, error: "Page view tracking is disabled for this workspace" }
  }

  // Validar input
  if (!input.workspaceId || !input.pageId || !input.pageSlug) {
    return { success: false, error: "Missing required fields: workspaceId, pageId, pageSlug" }
  }

  // Gerar ID do evento
  const eventId = generateEventId()

  // Adicionar ao buffer
  pageViewBuffer.push(input)

  // Flush buffer se atingir tamanho máximo
  if (pageViewBuffer.length >= PAGE_VIEW_BUFFER_SIZE) {
    flushPageViewBuffer()
  }

  return { success: true, eventId }
}

/**
 * Processa o buffer de page views
 * Esta função será conectada à camada de persistência quando disponível
 */
export function flushPageViewBuffer(): void {
  if (pageViewBuffer.length === 0) return

  // Capturar eventos do buffer
  const eventsToProcess = [...pageViewBuffer]
  pageViewBuffer = []

  // STUB: A persistência será implementada quando o schema for aplicado
  // Por enquanto, apenas logamos que eventos foram processados
  // Em produção, isso chamará a camada de repositório

  // console.log(`[PageView] Flushing ${eventsToProcess.length} events`)

  // Aqui seria chamado:
  // await analyticsRepository.batchInsertPageViews(eventsToProcess)
}

/**
 * Helper para tracking de page view que pode ser chamado em Server Components
 * Retorna dados necessários para o cliente completar o tracking
 */
export function preparePageViewTracking(
  workspace: Workspace,
  page: PageConfig,
): { shouldTrack: boolean; trackingData?: TrackPageViewInput } {
  if (!isTrackingEnabled(workspace, "pageViews")) {
    return { shouldTrack: false }
  }

  return {
    shouldTrack: true,
    trackingData: {
      workspaceId: workspace.workspaceId,
      pageId: page.id,
      pageSlug: page.slug,
    },
  }
}

let flushInterval: ReturnType<typeof setInterval> | null = null

/**
 * Inicia o flush automático do buffer de page views
 * Deve ser chamado uma vez na inicialização do app
 */
export function startPageViewFlushInterval(): void {
  if (flushInterval) return
  flushInterval = setInterval(flushPageViewBuffer, PAGE_VIEW_FLUSH_INTERVAL)
}

/**
 * Para o flush automático (para cleanup em testes)
 */
export function stopPageViewFlushInterval(): void {
  if (flushInterval) {
    clearInterval(flushInterval)
    flushInterval = null
  }
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Cria nova página
 */
export function createPage(input: CreatePageInput, existingPages: PageConfig[] = []): PageOperationResult {
  // Validar input
  const validation = validateCreatePageInput(input)
  if (!validation.valid) {
    return { success: false, errors: validation.errors }
  }

  // Normalizar slug
  const slugValidation = validateSlug(input.slug)
  const normalizedSlug = slugValidation.normalized!

  // Verificar disponibilidade
  if (!isSlugAvailable(normalizedSlug, input.workspaceId, existingPages)) {
    return {
      success: false,
      errors: [
        {
          field: "slug",
          message: `Slug '${normalizedSlug}' já está em uso neste workspace`,
          code: "SLUG_TAKEN",
        },
      ],
    }
  }

  // Validar hierarquia se tem parent
  if (input.parentId) {
    const hierarchyValidation = validatePageHierarchy("new", input.parentId, existingPages)
    if (!hierarchyValidation.valid) {
      return {
        success: false,
        errors: [
          {
            field: "parentId",
            message: hierarchyValidation.error!,
            code: "INVALID_HIERARCHY",
          },
        ],
      }
    }
  }

  // Calcular ordem
  const order = calculateNextOrder(input.workspaceId, input.parentId, existingPages)

  const now = new Date().toISOString()

  const page: PageConfig = {
    id: generatePageId(),
    workspaceId: input.workspaceId,
    slug: normalizedSlug,
    title: input.title.trim(),
    description: input.description?.trim(),
    content: input.content,
    visibility: input.visibility || "draft",
    layout: input.layout || "default",
    parentId: input.parentId,
    order,
    icon: input.icon,
    customMeta: input.customMeta,
    permissions: input.permissions,
    createdBy: input.createdBy,
    updatedBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
    publishedAt: input.visibility === "public" ? now : undefined,
  }

  return { success: true, page }
}

/**
 * Atualiza página existente
 */
export function updatePage(
  existing: PageConfig,
  updates: UpdatePageInput,
  allPages: PageConfig[] = [],
): PageOperationResult {
  // Validar input
  const validation = validateUpdatePageInput(updates)
  if (!validation.valid) {
    return { success: false, errors: validation.errors }
  }

  // Validar hierarquia se mudando parent
  if (updates.parentId !== undefined && updates.parentId !== existing.parentId) {
    const hierarchyValidation = validatePageHierarchy(existing.id, updates.parentId, allPages)
    if (!hierarchyValidation.valid) {
      return {
        success: false,
        errors: [
          {
            field: "parentId",
            message: hierarchyValidation.error!,
            code: "INVALID_HIERARCHY",
          },
        ],
      }
    }
  }

  const now = new Date().toISOString()

  // Determinar se deve publicar
  const shouldPublish = updates.visibility === "public" && existing.visibility !== "public"

  const updated: PageConfig = {
    ...existing,
    title: updates.title?.trim() ?? existing.title,
    description: updates.description?.trim() ?? existing.description,
    content: updates.content ?? existing.content,
    visibility: updates.visibility ?? existing.visibility,
    layout: updates.layout ?? existing.layout,
    parentId: updates.parentId !== undefined ? updates.parentId : existing.parentId,
    order: updates.order ?? existing.order,
    icon: updates.icon ?? existing.icon,
    customMeta: updates.customMeta ? { ...existing.customMeta, ...updates.customMeta } : existing.customMeta,
    permissions: updates.permissions ? { ...existing.permissions, ...updates.permissions } : existing.permissions,
    updatedBy: updates.updatedBy,
    updatedAt: now,
    publishedAt: shouldPublish ? now : existing.publishedAt,
  }

  return { success: true, page: updated }
}

/**
 * Soft delete página
 */
export function deletePage(page: PageConfig): PageConfig {
  return {
    ...page,
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Restaura página deletada
 */
export function restorePage(page: PageConfig): PageConfig {
  return {
    ...page,
    deletedAt: undefined,
    updatedAt: new Date().toISOString(),
  }
}

// ============================================
// HIERARQUIA E NAVEGAÇÃO
// ============================================

/**
 * Constrói hierarquia completa de páginas
 */
export function buildPageHierarchy(pages: PageConfig[], parentId: string | null = null, level = 0): PageHierarchy[] {
  const children = pages.filter((p) => p.parentId === parentId && !p.deletedAt).sort((a, b) => a.order - b.order)

  return children.map((page) => {
    const path = getPagePath(page.id, pages)
    return {
      page,
      children: buildPageHierarchy(pages, page.id, level + 1),
      level,
      path,
    }
  })
}

/**
 * Obtém caminho completo da página (array de slugs)
 */
export function getPagePath(pageId: string, allPages: PageConfig[]): string[] {
  const page = allPages.find((p) => p.id === pageId)
  if (!page) return []

  if (!page.parentId) {
    return [page.slug]
  }

  return [...getPagePath(page.parentId, allPages), page.slug]
}

/**
 * Obtém breadcrumbs da página
 */
export function getPageBreadcrumbs(
  pageId: string,
  allPages: PageConfig[],
): Array<{ id: string; title: string; slug: string }> {
  const path = getPagePath(pageId, allPages)
  const breadcrumbs: Array<{ id: string; title: string; slug: string }> = []

  let currentParentId: string | undefined
  for (const slug of path) {
    const page = allPages.find((p) => p.slug === slug && p.parentId === currentParentId)
    if (page) {
      breadcrumbs.push({ id: page.id, title: page.title, slug: page.slug })
      currentParentId = page.id
    }
  }

  return breadcrumbs
}

/**
 * Busca páginas com filtros
 */
export function filterPages(pages: PageConfig[], filters: PageFilters): PageConfig[] {
  let filtered = pages.filter((p) => p.workspaceId === filters.workspaceId)

  if (!filters.includeDeleted) {
    filtered = filtered.filter((p) => !p.deletedAt)
  }

  if (filters.visibility) {
    filtered = filtered.filter((p) => p.visibility === filters.visibility)
  }

  if (filters.parentId !== undefined) {
    filtered = filtered.filter((p) => p.parentId === filters.parentId)
  }

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query),
    )
  }

  return filtered.sort((a, b) => a.order - b.order)
}

// ============================================
// TRANSFORMAÇÕES DB <-> DOMAIN
// ============================================

/**
 * Transforma DB row para PageConfig
 */
export function dbToPageConfig(db: DBPage): PageConfig {
  return {
    id: db.id,
    workspaceId: db.workspace_id,
    slug: db.slug,
    title: db.title,
    description: db.description || undefined,
    content: db.content || undefined,
    visibility: db.visibility,
    layout: db.layout,
    parentId: db.parent_id || undefined,
    order: db.order_index,
    icon: db.icon || undefined,
    customMeta: (db.custom_meta as PageConfig["customMeta"]) || undefined,
    permissions: (db.permissions as PageConfig["permissions"]) || undefined,
    createdBy: db.created_by,
    updatedBy: db.updated_by,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    publishedAt: db.published_at || undefined,
    deletedAt: db.deleted_at || undefined,
  }
}

/**
 * Transforma PageConfig para DB row
 */
export function pageConfigToDb(page: PageConfig): DBPage {
  return {
    id: page.id,
    workspace_id: page.workspaceId,
    slug: page.slug,
    title: page.title,
    description: page.description || null,
    content: page.content || null,
    visibility: page.visibility,
    layout: page.layout,
    parent_id: page.parentId || null,
    order_index: page.order,
    icon: page.icon || null,
    custom_meta: (page.customMeta as Record<string, unknown>) || null,
    permissions: (page.permissions as Record<string, unknown>) || null,
    created_by: page.createdBy,
    updated_by: page.updatedBy,
    created_at: page.createdAt,
    updated_at: page.updatedAt,
    published_at: page.publishedAt || null,
    deleted_at: page.deletedAt || null,
  }
}

// ============================================
// HELPERS
// ============================================

function generatePageId(): string {
  return "page_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function generateEventId(): string {
  return "evt_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

// ============================================
// TESTES MENTAIS
// ============================================
/*
TEST: validateSlug - Normalização
INPUT: "Página de Financeiro!"
EXPECTED: { valid: true, normalized: "pagina-de-financeiro" }

TEST: validateSlug - Slug reservado
INPUT: "dashboard"
EXPECTED: { valid: false, errors: ["Slug 'dashboard' é reservado pelo sistema"] }

TEST: validateSlug - Muito curto
INPUT: "a"
EXPECTED: { valid: false, errors: ["Slug deve ter no mínimo 2 caracteres"] }

TEST: isSlugAvailable - Slug duplicado
INPUT: ("financeiro", "ws-1", [{ slug: "financeiro", workspaceId: "ws-1", deletedAt: undefined }])
EXPECTED: false

TEST: canUserViewPage - Página pública
INPUT: ({ visibility: "public" }, ["member"])
EXPECTED: true

TEST: canUserViewPage - Página draft sem permissão
INPUT: ({ visibility: "draft", permissions: { canEdit: ["admin"] } }, ["member"])
EXPECTED: false

TEST: canUserEditPage - Admin sempre pode
INPUT: (anyPage, ["admin"])
EXPECTED: true

TEST: validatePageHierarchy - Loop circular
INPUT: ("page-1", "page-2", [{ id: "page-2", parentId: "page-1" }])
EXPECTED: { valid: false, error: "Hierarquia circular detectada" }

TEST: validatePageHierarchy - Profundidade máxima
INPUT: ("page-new", "page-5", [chain de 5 páginas])
EXPECTED: { valid: false, error: "Hierarquia máxima de 5 níveis excedida" }

TEST: calculateNextOrder - Primeiro filho
INPUT: ("ws-1", undefined, [])
EXPECTED: 0

TEST: calculateNextOrder - Próximo irmão
INPUT: ("ws-1", "parent-1", [{ parentId: "parent-1", order: 0 }, { parentId: "parent-1", order: 1 }])
EXPECTED: 2

TEST: buildPageHierarchy - Estrutura completa
INPUT: ([{ id: "1", parentId: null }, { id: "2", parentId: "1" }, { id: "3", parentId: "1" }])
EXPECTED: [{ page: "1", children: [{ page: "2", children: [] }, { page: "3", children: [] }] }]

TEST: getPagePath - Caminho completo
INPUT: ("page-3", [{ id: "page-1", slug: "docs", parentId: null }, { id: "page-2", slug: "api", parentId: "page-1" }, { id: "page-3", slug: "endpoints", parentId: "page-2" }])
EXPECTED: ["docs", "api", "endpoints"]

TEST: filterPages - Busca por título
INPUT: (pages, { workspaceId: "ws-1", searchQuery: "financial" })
EXPECTED: Retorna apenas páginas com "financial" no título/descrição/slug

TEST: emitPageViewEvent - Tracking desabilitado
INPUT: (workspaceWithTrackingDisabled, validInput)
EXPECTED: { success: false, error: "Page view tracking is disabled..." }

TEST: emitPageViewEvent - Input válido
INPUT: (workspaceWithTrackingEnabled, { workspaceId, pageId, pageSlug })
EXPECTED: { success: true, eventId: "evt_..." }
*/
