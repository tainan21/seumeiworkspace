// ============================================
// REPOSITORY: Layout Builder
// Operacoes de banco para configuracoes de layout
// ============================================

import { getDb } from "../client"
import type {
  LayoutConfig,
  DBWorkspaceLayout,
  DBLayoutPreset,
  LayoutOperationResult,
} from "@/domains/layout-builder/layout-builder.types"
import {
  createLayoutConfig,
  validateLayoutConfig,
} from "@/domains/layout-builder/layout-builder"

// ============================================
// WORKSPACE LAYOUTS
// ============================================

/**
 * Busca todos os layouts de um workspace
 */
export async function getWorkspaceLayouts(
  workspaceId: string
): Promise<LayoutConfig[]> {
  const sql = getDb()
  const rows = await sql<DBWorkspaceLayout[]>`
    SELECT * FROM workspace_layouts 
    WHERE workspace_id = ${workspaceId}
    ORDER BY created_at DESC
  `
  return rows.map(dbToLayoutConfig)
}

/**
 * Busca o layout ativo de um workspace
 */
export async function getActiveLayout(
  workspaceId: string
): Promise<LayoutConfig | null> {
  const sql = getDb()
  const rows = await sql<DBWorkspaceLayout[]>`
    SELECT * FROM workspace_layouts 
    WHERE workspace_id = ${workspaceId} AND is_active = true
    LIMIT 1
  `
  if (rows.length === 0) return null
  return dbToLayoutConfig(rows[0])
}

/**
 * Busca layout por ID
 */
export async function getLayoutById(
  layoutId: string
): Promise<LayoutConfig | null> {
  const sql = getDb()
  const rows = await sql<DBWorkspaceLayout[]>`
    SELECT * FROM workspace_layouts 
    WHERE id = ${layoutId}
    LIMIT 1
  `
  if (rows.length === 0) return null
  return dbToLayoutConfig(rows[0])
}

/**
 * Cria novo layout para workspace
 */
export async function createLayout(
  workspaceId: string,
  config: Partial<LayoutConfig>,
  name: string,
  description?: string
): Promise<LayoutOperationResult> {
  const fullConfig = createLayoutConfig({
    ...config,
    name,
    description,
    workspaceId,
  })

  const validation = validateLayoutConfig(fullConfig)
  if (!validation.valid) {
    return { success: false, errors: validation.errors }
  }

  const sql = getDb()

  const rows = await sql<DBWorkspaceLayout[]>`
    INSERT INTO workspace_layouts (
      workspace_id,
      name,
      description,
      config,
      is_active
    ) VALUES (
      ${workspaceId},
      ${name},
      ${description || null},
      ${JSON.stringify(fullConfig)},
      false
    )
    RETURNING *
  `

  return { success: true, layout: dbToLayoutConfig(rows[0]) }
}

/**
 * Atualiza layout existente
 */
export async function updateLayout(
  layoutId: string,
  updates: Partial<LayoutConfig>
): Promise<LayoutOperationResult> {
  const existing = await getLayoutById(layoutId)
  if (!existing) {
    return {
      success: false,
      errors: [{ field: "id", message: "Layout nao encontrado", code: "NOT_FOUND" }],
    }
  }

  const updatedConfig = createLayoutConfig({
    ...existing,
    ...updates,
  })

  const validation = validateLayoutConfig(updatedConfig)
  if (!validation.valid) {
    return { success: false, errors: validation.errors }
  }

  const sql = getDb()

  const rows = await sql<DBWorkspaceLayout[]>`
    UPDATE workspace_layouts 
    SET 
      name = ${updatedConfig.name},
      description = ${updatedConfig.description || null},
      config = ${JSON.stringify(updatedConfig)}
    WHERE id = ${layoutId}
    RETURNING *
  `

  return { success: true, layout: dbToLayoutConfig(rows[0]) }
}

/**
 * Define layout como ativo
 */
export async function setActiveLayout(
  workspaceId: string,
  layoutId: string
): Promise<LayoutOperationResult> {
  const layout = await getLayoutById(layoutId)
  if (!layout) {
    return {
      success: false,
      errors: [{ field: "id", message: "Layout nao encontrado", code: "NOT_FOUND" }],
    }
  }

  if (layout.workspaceId !== workspaceId) {
    return {
      success: false,
      errors: [
        { field: "workspaceId", message: "Layout nao pertence ao workspace", code: "UNAUTHORIZED" },
      ],
    }
  }

  const sql = getDb()

  // O trigger garante que apenas um layout estara ativo
  const rows = await sql<DBWorkspaceLayout[]>`
    UPDATE workspace_layouts 
    SET is_active = true
    WHERE id = ${layoutId}
    RETURNING *
  `

  return { success: true, layout: dbToLayoutConfig(rows[0]) }
}

/**
 * Deleta layout
 */
export async function deleteLayout(layoutId: string): Promise<boolean> {
  const sql = getDb()
  const result = await sql`
    DELETE FROM workspace_layouts 
    WHERE id = ${layoutId}
  `
  return result.count > 0
}

// ============================================
// LAYOUT PRESETS
// ============================================

/**
 * Busca todos os presets disponiveis
 */
export async function getAllPresets(): Promise<DBLayoutPreset[]> {
  const sql = getDb()
  return await sql<DBLayoutPreset[]>`
    SELECT * FROM layout_presets 
    ORDER BY is_system DESC, name ASC
  `
}

/**
 * Busca presets por categoria
 */
export async function getPresetsByCategory(
  category: string
): Promise<DBLayoutPreset[]> {
  const sql = getDb()
  return await sql<DBLayoutPreset[]>`
    SELECT * FROM layout_presets 
    WHERE category = ${category}
    ORDER BY is_system DESC, name ASC
  `
}

/**
 * Busca preset por ID
 */
export async function getPresetById(
  presetId: string
): Promise<DBLayoutPreset | null> {
  const sql = getDb()
  const rows = await sql<DBLayoutPreset[]>`
    SELECT * FROM layout_presets 
    WHERE id = ${presetId}
    LIMIT 1
  `
  return rows.length > 0 ? rows[0] : null
}

// ============================================
// TRANSFORMERS
// ============================================

function dbToLayoutConfig(db: DBWorkspaceLayout): LayoutConfig {
  const config = typeof db.config === "string" ? JSON.parse(db.config) : db.config
  return {
    ...createLayoutConfig(config),
    id: db.id,
    workspaceId: db.workspace_id,
    name: db.name,
    description: db.description || undefined,
    isActive: db.is_active,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  }
}
