"use server";

import { redirect } from "next/navigation";
import { prisma } from "~/lib/server/db";
import * as WorkspaceService from "~/domains/workspace/services/workspace.service";

/**
 * Rotas que não requerem onboarding completo
 */
const BYPASS_ROUTES = [
  "/onboarding",
  "/settings",
  "/api",
];

/**
 * Verifica se uma rota pode bypassar o onboarding
 */
function canBypassOnboarding(pathname: string): boolean {
  return BYPASS_ROUTES.some((route) => pathname.includes(route));
}

/**
 * Middleware para detectar necessidade de onboarding
 * Verifica se workspace tem OnboardingCompletion.isCompleted = false
 * e redireciona para /onboarding se necessário
 * 
 * @param workspaceSlug - Slug do workspace
 * @param pathname - Caminho atual
 * @returns true se pode continuar, false se precisa redirect
 */
export async function checkOnboardingRequired(
  workspaceSlug: string,
  pathname: string
): Promise<{ required: boolean; redirectTo?: string }> {
  // Permitir bypass para rotas específicas
  if (canBypassOnboarding(pathname)) {
    return { required: false };
  }

  if (!workspaceSlug?.trim()) {
    return { required: false };
  }

  try {
    // Buscar workspace
    const workspace = await WorkspaceService.getWorkspaceBySlug(workspaceSlug);

    if (!workspace) {
      return { required: false };
    }

    // Buscar OnboardingCompletion
    const onboarding = await prisma.onboardingCompletion.findUnique({
      where: { workspaceId: workspace.id },
    });

    // Se não existe onboarding ou não está completo, requer onboarding
    if (!onboarding || !onboarding.isCompleted) {
      return {
        required: true,
        redirectTo: `/${workspaceSlug}/onboarding`,
      };
    }

    return { required: false };
  } catch (error) {
    console.error("[checkOnboardingRequired] Error:", error);
    // Em caso de erro, permitir acesso (fail open)
    return { required: false };
  }
}

/**
 * Helper para usar em Server Components
 * Retorna true se onboarding está completo
 */
export async function isOnboardingComplete(
  workspaceId: string
): Promise<boolean> {
  if (!workspaceId?.trim()) {
    return false;
  }

  try {
    const onboarding = await prisma.onboardingCompletion.findUnique({
      where: { workspaceId },
      select: { isCompleted: true },
    });

    return onboarding?.isCompleted ?? false;
  } catch (error) {
    console.error("[isOnboardingComplete] Error:", error);
    return false;
  }
}
