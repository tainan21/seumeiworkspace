"use server";

import { prisma } from "~/lib/server/db";

/**
 * Feature flags por workspace
 * Permite controle granular de features em produção
 */
const featureFlagsCache = new Map<string, Map<string, boolean>>();

/**
 * Verifica se feature flag está ativa
 */
export async function isFeatureFlagEnabled(
  flag: string,
  workspaceId?: string
): Promise<boolean> {
  // Feature flags globais (sem workspace)
  const globalFlags: Record<string, boolean> = {
    "new-onboarding": true,
    "react-query": true,
    "audit-logs": true,
  };

  // Se não tem workspace, verificar apenas flags globais
  if (!workspaceId) {
    return globalFlags[flag] ?? false;
  }

  // Verificar cache
  const cached = featureFlagsCache.get(workspaceId);
  if (cached?.has(flag)) {
    return cached.get(flag) ?? false;
  }

  // Buscar do banco (workspace.settings.featureFlags)
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { settings: true },
    });

    const settings = workspace?.settings as Record<string, unknown> | null;
    const flags = (settings?.featureFlags as Record<string, boolean>) || {};

    // Atualizar cache
    if (!cached) {
      featureFlagsCache.set(workspaceId, new Map());
    }
    featureFlagsCache.get(workspaceId)!.set(flag, flags[flag] ?? globalFlags[flag] ?? false);

    return flags[flag] ?? globalFlags[flag] ?? false;
  } catch (error) {
    console.error("[isFeatureFlagEnabled] Error:", error);
    return globalFlags[flag] ?? false;
  }
}

/**
 * Define feature flag para workspace
 */
export async function setFeatureFlag(
  flag: string,
  enabled: boolean,
  workspaceId: string
): Promise<void> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true },
  });

  const settings = (workspace?.settings as Record<string, unknown>) || {};
  const flags = (settings.featureFlags as Record<string, boolean>) || {};

  flags[flag] = enabled;

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      settings: {
        ...settings,
        featureFlags: flags,
      },
    },
  });

  // Invalidar cache
  featureFlagsCache.delete(workspaceId);
}

/**
 * Lista todas as feature flags disponíveis
 */
export function getAvailableFeatureFlags(): string[] {
  return [
    "new-onboarding",
    "react-query",
    "audit-logs",
    "advanced-analytics",
    "ai-assistant",
    "custom-themes",
  ];
}
