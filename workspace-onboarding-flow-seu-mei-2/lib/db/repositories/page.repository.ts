// ============================================
// REPOSITORY: Page
// Acesso a dados de páginas
// ============================================

import { getDbClient, type DatabaseClient } from "../client"
import type { DBPage } from "../schemas"
import type { PageConfig, PageFilters } from "@/domains/page/page.types"
import { dbToPageConfig, pageConfigToDb } from "@/domains/page/page"

// ============================================
// CREATE
// ============================================

export async function createPageInDb(page: PageConfig, client?: DatabaseClient): Promise<DBPage> {
  const db = client || getDbClient()
  const dbPage = pageConfigToDb(page)

  const [created] = await db.query<DBPage>(
    `
    INSERT INTO pages (
      id, workspace_id, slug, title, description, content,
      visibility, layout, parent_id, order_index, icon,
      custom_meta, permissions, created_by, updated_by,
      created_at, updated_at, published_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING *
  `,
    [
      dbPage.id,
      dbPage.workspace_id,
      dbPage.slug,
      dbPage.title,
      dbPage.description,
      dbPage.content,
      dbPage.visibility,
      dbPage.layout,
      dbPage.parent_id,
      dbPage.order_index,
      dbPage.icon,
      dbPage.custom_meta,
      dbPage.permissions,
      dbPage.created_by,
      dbPage.updated_by,
      dbPage.created_at,
      dbPage.updated_at,
      dbPage.published_at,
    ],
  )

  return created
}

// ============================================
// READ
// ============================================

export async function findPageById(pageId: string, client?: DatabaseClient): Promise<PageConfig | null> {
  const db = client || getDbClient()

  const page = await db.queryOne<DBPage>(
    `
    SELECT * FROM pages WHERE id = $1 AND deleted_at IS NULL
  `,
    [pageId],
  )

  return page ? dbToPageConfig(page) : null
}

export async function findPageBySlug(
  workspaceId: string,
  slug: string,
  client?: DatabaseClient,
): Promise<PageConfig | null> {
  const db = client || getDbClient()

  const page = await db.queryOne<DBPage>(
    `
    SELECT * FROM pages 
    WHERE workspace_id = $1 AND slug = $2 AND deleted_at IS NULL
  `,
    [workspaceId, slug],
  )

  return page ? dbToPageConfig(page) : null
}

export async function findPagesByWorkspace(
  workspaceId: string,
  filters?: Omit<PageFilters, "workspaceId">,
  client?: DatabaseClient,
): Promise<PageConfig[]> {
  const db = client || getDbClient()

  let query = `
    SELECT * FROM pages
    WHERE workspace_id = $1
  `
  const params: any[] = [workspaceId]
  let paramIndex = 2

  if (!filters?.includeDeleted) {
    query += ` AND deleted_at IS NULL`
  }

  if (filters?.visibility) {
    query += ` AND visibility = $${paramIndex}`
    params.push(filters.visibility)
    paramIndex++
  }

  if (filters?.parentId !== undefined) {
    if (filters.parentId === null) {
      query += ` AND parent_id IS NULL`
    } else {
      query += ` AND parent_id = $${paramIndex}`
      params.push(filters.parentId)
      paramIndex++
    }
  }

  if (filters?.searchQuery) {
    query += ` AND (
      title ILIKE $${paramIndex} OR
      description ILIKE $${paramIndex} OR
      slug ILIKE $${paramIndex}
    )`
    params.push(`%${filters.searchQuery}%`)
    paramIndex++
  }

  query += ` ORDER BY order_index ASC, created_at DESC`

  const pages = await db.query<DBPage>(query, params)
  return pages.map(dbToPageConfig)
}

export async function findPagesByParent(parentId: string | null, client?: DatabaseClient): Promise<PageConfig[]> {
  const db = client || getDbClient()

  const query = parentId
    ? `SELECT * FROM pages WHERE parent_id = $1 AND deleted_at IS NULL ORDER BY order_index`
    : `SELECT * FROM pages WHERE parent_id IS NULL AND deleted_at IS NULL ORDER BY order_index`

  const params = parentId ? [parentId] : []
  const pages = await db.query<DBPage>(query, params)

  return pages.map(dbToPageConfig)
}

// ============================================
// UPDATE
// ============================================

export async function updatePageInDb(page: PageConfig, client?: DatabaseClient): Promise<DBPage> {
  const db = client || getDbClient()
  const dbPage = pageConfigToDb(page)

  const [updated] = await db.query<DBPage>(
    `
    UPDATE pages SET
      title = $2,
      description = $3,
      content = $4,
      visibility = $5,
      layout = $6,
      parent_id = $7,
      order_index = $8,
      icon = $9,
      custom_meta = $10,
      permissions = $11,
      updated_by = $12,
      updated_at = $13,
      published_at = $14
    WHERE id = $1
    RETURNING *
  `,
    [
      dbPage.id,
      dbPage.title,
      dbPage.description,
      dbPage.content,
      dbPage.visibility,
      dbPage.layout,
      dbPage.parent_id,
      dbPage.order_index,
      dbPage.icon,
      dbPage.custom_meta,
      dbPage.permissions,
      dbPage.updated_by,
      dbPage.updated_at,
      dbPage.published_at,
    ],
  )

  return updated
}

// ============================================
// DELETE
// ============================================

export async function softDeletePage(pageId: string, client?: DatabaseClient): Promise<void> {
  const db = client || getDbClient()

  await db.execute(
    `
    UPDATE pages SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = $1
  `,
    [pageId],
  )
}

export async function restorePageInDb(pageId: string, client?: DatabaseClient): Promise<void> {
  const db = client || getDbClient()

  await db.execute(
    `
    UPDATE pages SET deleted_at = NULL, updated_at = NOW()
    WHERE id = $1
  `,
    [pageId],
  )
}

export async function permanentDeletePage(pageId: string, client?: DatabaseClient): Promise<void> {
  const db = client || getDbClient()

  await db.execute(`DELETE FROM pages WHERE id = $1`, [pageId])
}

// ============================================
// BULK OPERATIONS
// ============================================

export async function reorderPages(pageIds: string[], newOrders: number[], client?: DatabaseClient): Promise<void> {
  const db = client || getDbClient()

  await db.transaction(async (tx) => {
    for (let i = 0; i < pageIds.length; i++) {
      await tx.execute(
        `
        UPDATE pages SET order_index = $2, updated_at = NOW()
        WHERE id = $1
      `,
        [pageIds[i], newOrders[i]],
      )
    }
  })
}

// ============================================
// VERSIONING (opcional)
// ============================================

export async function createPageVersion(
  pageId: string,
  versionNumber: number,
  content: Partial<PageConfig>,
  client?: DatabaseClient,
): Promise<void> {
  const db = client || getDbClient()

  await db.execute(
    `
    INSERT INTO page_versions (
      page_id, version_number, title, description, content,
      visibility, layout, custom_meta, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `,
    [
      pageId,
      versionNumber,
      content.title,
      content.description,
      content.content,
      content.visibility,
      content.layout,
      content.customMeta,
      content.updatedBy,
    ],
  )
}
