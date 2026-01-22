// ============================================
// REPOSITORY: User Settings
// ============================================

import { getDbClient, type DatabaseClient } from "../client"
import type { DBUserSettings } from "../schemas"

export interface UserSettingsData {
  userId: string
  defaultWorkspaceId?: string
  uiPreferences?: Record<string, unknown>
  notificationPreferences?: Record<string, unknown>
}

export async function upsertUserSettings(data: UserSettingsData, client?: DatabaseClient): Promise<DBUserSettings> {
  const db = client || getDbClient()

  const [settings] = await db.query<DBUserSettings>(
    `
    INSERT INTO user_settings (user_id, default_workspace_id, ui_preferences, notification_preferences)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id) DO UPDATE SET
      default_workspace_id = COALESCE($2, user_settings.default_workspace_id),
      ui_preferences = COALESCE($3, user_settings.ui_preferences),
      notification_preferences = COALESCE($4, user_settings.notification_preferences),
      updated_at = NOW()
    RETURNING *
  `,
    [
      data.userId,
      data.defaultWorkspaceId || null,
      JSON.stringify(data.uiPreferences || {}),
      JSON.stringify(data.notificationPreferences || {}),
    ],
  )

  return settings
}

export async function findUserSettings(userId: string, client?: DatabaseClient): Promise<DBUserSettings | null> {
  const db = client || getDbClient()

  return db.queryOne<DBUserSettings>(
    `
    SELECT * FROM user_settings WHERE user_id = $1
  `,
    [userId],
  )
}

// ============================================
// MIGRATION: Mock -> DB
// ============================================

export interface MockUserSettings {
  theme?: string
  defaultWorkspaceId?: string
  locale?: string
  notifications?: boolean
}

export async function migrateFromMockSettings(
  userId: string,
  mockSettings: MockUserSettings,
  client?: DatabaseClient,
): Promise<DBUserSettings> {
  return upsertUserSettings(
    {
      userId,
      defaultWorkspaceId: mockSettings.defaultWorkspaceId,
      uiPreferences: {
        theme: mockSettings.theme,
        locale: mockSettings.locale,
      },
      notificationPreferences: {
        enabled: mockSettings.notifications ?? true,
      },
    },
    client,
  )
}
