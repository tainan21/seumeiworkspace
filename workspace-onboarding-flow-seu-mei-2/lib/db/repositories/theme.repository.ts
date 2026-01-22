// ============================================
// REPOSITORY: Theme
// Persistência de temas no banco de dados
// ============================================

import { db } from "../client"
import type { DBWorkspaceTheme } from "../schemas"
import type { ThemeConfig, CreateThemeInput, UpdateThemeInput } from "@/domains/theme/theme.types"
import { createThemeConfig, updateThemeConfig, dbToThemeConfig, themeConfigToDb } from "@/domains/theme/theme"

/**
 * Busca tema por workspace ID
 */
export async function findThemeByWorkspaceId(workspaceId: string): Promise<ThemeConfig | null> {
  try {
    const result = await db<DBWorkspaceTheme[]>`
      SELECT * FROM workspace_themes
      WHERE workspace_id = ${workspaceId}
      LIMIT 1
    `

    if (result.length === 0) {
      return null
    }

    return dbToThemeConfig(result[0])
  } catch (error) {
    console.error("[ThemeRepository] Error finding theme:", error)
    return null
  }
}

/**
 * Cria tema no banco de dados
 */
export async function createThemeInDb(
  input: CreateThemeInput,
): Promise<{ success: true; theme: ThemeConfig } | { success: false; error: string }> {
  // Usar domain para criar e validar
  const result = createThemeConfig(input)

  if (!result.success) {
    return {
      success: false,
      error: result.errors.map((e) => e.message).join("; "),
    }
  }

  const dbRow = themeConfigToDb(result.theme)

  try {
    await db`
      INSERT INTO workspace_themes (
        id, workspace_id, style, primary_color, accent_color,
        custom_colors, is_dark_mode, created_at, updated_at
      ) VALUES (
        ${dbRow.id},
        ${dbRow.workspace_id},
        ${dbRow.style},
        ${dbRow.primary_color},
        ${dbRow.accent_color},
        ${dbRow.custom_colors ? JSON.stringify(dbRow.custom_colors) : null}::jsonb,
        ${dbRow.is_dark_mode},
        ${dbRow.created_at},
        ${dbRow.updated_at}
      )
    `

    return { success: true, theme: result.theme }
  } catch (error) {
    console.error("[ThemeRepository] Error creating theme:", error)
    return { success: false, error: "Erro ao salvar tema no banco" }
  }
}

/**
 * Atualiza tema existente
 */
export async function updateThemeInDb(
  workspaceId: string,
  updates: UpdateThemeInput,
): Promise<{ success: true; theme: ThemeConfig } | { success: false; error: string }> {
  // Buscar tema existente
  const existing = await findThemeByWorkspaceId(workspaceId)

  if (!existing) {
    return { success: false, error: "Tema não encontrado" }
  }

  // Usar domain para atualizar e validar
  const result = updateThemeConfig(existing, updates)

  if (!result.success) {
    return {
      success: false,
      error: result.errors.map((e) => e.message).join("; "),
    }
  }

  const dbRow = themeConfigToDb(result.theme)

  try {
    await db`
      UPDATE workspace_themes SET
        style = ${dbRow.style},
        primary_color = ${dbRow.primary_color},
        accent_color = ${dbRow.accent_color},
        custom_colors = ${dbRow.custom_colors ? JSON.stringify(dbRow.custom_colors) : null}::jsonb,
        is_dark_mode = ${dbRow.is_dark_mode},
        updated_at = NOW()
      WHERE workspace_id = ${workspaceId}
    `

    // Registrar histórico
    await db`
      INSERT INTO workspace_theme_history (
        workspace_id, previous_style, new_style,
        previous_primary, new_primary,
        previous_accent, new_accent
      ) VALUES (
        ${workspaceId},
        ${existing.style},
        ${result.theme.style},
        ${existing.colors.primary},
        ${result.theme.colors.primary},
        ${existing.colors.accent},
        ${result.theme.colors.accent}
      )
    `

    return { success: true, theme: result.theme }
  } catch (error) {
    console.error("[ThemeRepository] Error updating theme:", error)
    return { success: false, error: "Erro ao atualizar tema no banco" }
  }
}

/**
 * Deleta tema (soft delete via workspace)
 */
export async function deleteThemeByWorkspaceId(workspaceId: string): Promise<boolean> {
  try {
    await db`
      DELETE FROM workspace_themes
      WHERE workspace_id = ${workspaceId}
    `
    return true
  } catch (error) {
    console.error("[ThemeRepository] Error deleting theme:", error)
    return false
  }
}

/**
 * Upsert: cria ou atualiza tema
 */
export async function upsertTheme(
  input: CreateThemeInput,
): Promise<{ success: true; theme: ThemeConfig } | { success: false; error: string }> {
  const existing = await findThemeByWorkspaceId(input.workspaceId)

  if (existing) {
    return updateThemeInDb(input.workspaceId, {
      style: input.style,
      colors: input.colors,
      customColors: input.customColors,
      isDarkMode: input.isDarkMode,
    })
  }

  return createThemeInDb(input)
}

// ============================================
// PALETAS DO USUÁRIO
// ============================================

interface UserColorPalette {
  id: string
  userId: string
  name: string
  primaryColor: string
  accentColor: string
  category: string
  isFavorite: boolean
  createdAt: string
}

/**
 * Lista paletas customizadas do usuário
 */
export async function findUserPalettes(userId: string): Promise<UserColorPalette[]> {
  try {
    const result = await db<
      Array<{
        id: string
        user_id: string
        name: string
        primary_color: string
        accent_color: string
        category: string
        is_favorite: boolean
        created_at: string
      }>
    >`
      SELECT * FROM user_color_palettes
      WHERE user_id = ${userId}
      ORDER BY is_favorite DESC, created_at DESC
    `

    return result.map((row) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      primaryColor: row.primary_color,
      accentColor: row.accent_color,
      category: row.category,
      isFavorite: row.is_favorite,
      createdAt: row.created_at,
    }))
  } catch (error) {
    console.error("[ThemeRepository] Error finding user palettes:", error)
    return []
  }
}

/**
 * Salva paleta customizada do usuário
 */
export async function saveUserPalette(
  userId: string,
  palette: {
    name: string
    primaryColor: string
    accentColor: string
    category?: string
  },
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const result = await db<[{ id: string }]>`
      INSERT INTO user_color_palettes (
        user_id, name, primary_color, accent_color, category
      ) VALUES (
        ${userId},
        ${palette.name},
        ${palette.primaryColor},
        ${palette.accentColor},
        ${palette.category || "custom"}
      )
      ON CONFLICT (user_id, name) DO UPDATE SET
        primary_color = ${palette.primaryColor},
        accent_color = ${palette.accentColor},
        category = ${palette.category || "custom"}
      RETURNING id
    `

    return { success: true, id: result[0].id }
  } catch (error) {
    console.error("[ThemeRepository] Error saving user palette:", error)
    return { success: false, error: "Erro ao salvar paleta" }
  }
}
