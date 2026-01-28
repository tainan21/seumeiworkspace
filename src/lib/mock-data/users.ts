import type { Workspace, BillingPlan } from "@/types/workspace"

export interface MockUser {
  id: string
  email: string
  name: string
  plan: BillingPlan
  createdAt: string
}

export const MOCK_CURRENT_USER: MockUser = {
  id: "user_mock_1",
  email: "demo@seumei.app",
  name: "Usuário Demo",
  plan: "free",
  createdAt: "2026-01-01T00:00:00.000Z",
}

// Workspaces existentes para testar enforceSingleFreeWorkspace
export const MOCK_EXISTING_WORKSPACES: Workspace[] = []

export function getMockUserSettings() {
  return {
    userId: MOCK_CURRENT_USER.id,
    locale: "pt-BR",
    timezone: "America/Sao_Paulo",
    notifications: {
      email: true,
      push: true,
    },
  }
}
