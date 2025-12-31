"use server";

import { prisma } from "~/lib/server/db";

/**
 * Regras de Domínio: Limitações por Usuário
 * - 1 Workspace por usuário
 * - 3 Projetos por usuário (dentro do workspace)
 */

export const WORKSPACE_LIMITS = {
  MAX_WORKSPACES_PER_USER: 1,
  MAX_PROJECTS_PER_USER: 3,
} as const;

/**
 * Verifica se o usuário pode criar um novo workspace
 * @param userId - ID do usuário
 * @returns true se pode criar, false caso contrário
 */
export async function canUserCreateWorkspace(userId: string): Promise<boolean> {
  if (!userId) {
    return false;
  }

  try {
    const count = await (prisma as any).workspace.count({
      where: {
        createdById: userId,
      },
    });
    return count < WORKSPACE_LIMITS.MAX_WORKSPACES_PER_USER;
  } catch (error) {
    console.error("[canUserCreateWorkspace] Error:", error);
    return false;
  }
}

/**
 * Verifica se o usuário pode criar um novo projeto
 * @param userId - ID do usuário
 * @returns true se pode criar, false caso contrário
 */
export async function canUserCreateProject(userId: string): Promise<boolean> {
  if (!userId) {
    return false;
  }

  try {
    const count = await prisma.project.count({
      where: {
        userId,
      },
    });
    return count < WORKSPACE_LIMITS.MAX_PROJECTS_PER_USER;
  } catch (error) {
    console.error("[canUserCreateProject] Error:", error);
    return false;
  }
}

/**
 * Retorna a contagem de workspaces do usuário
 * @param userId - ID do usuário
 * @returns Número de workspaces
 */
export async function getUserWorkspaceCount(userId: string): Promise<number> {
  if (!userId) {
    return 0;
  }

  try {
    return await (prisma as any).workspace.count({
      where: {
        createdById: userId,
      },
    });
  } catch (error) {
    console.error("[getUserWorkspaceCount] Error:", error);
    return 0;
  }
}

/**
 * Retorna a contagem de projetos do usuário
 * @param userId - ID do usuário
 * @returns Número de projetos
 */
export async function getUserProjectCount(userId: string): Promise<number> {
  if (!userId) {
    return 0;
  }

  try {
    return await prisma.project.count({
      where: {
        userId,
      },
    });
  } catch (error) {
    console.error("[getUserProjectCount] Error:", error);
    return 0;
  }
}
