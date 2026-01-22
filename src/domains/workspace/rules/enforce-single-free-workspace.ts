"use server";

import { prisma } from "~/lib/server/db";
import type { Workspace } from "@prisma/client";

/**
 * Resultado da validação de limite de workspace
 */
export type WorkspaceLimitResult =
  | { allowed: true }
  | {
      allowed: false;
      reason: string;
      suggestion?: string;
    };

/**
 * Tipo de plano do usuário
 */
type UserPlan = "free" | "pro" | "enterprise";

/**
 * Regra de domínio: enforceSingleFreeWorkspace
 * 
 * Valida se o usuário pode criar um novo workspace baseado em:
 * - Plano do usuário (FREE: 1 workspace, PRO: 3 workspaces, ENTERPRISE: ilimitado)
 * - Workspaces existentes do usuário
 * 
 * @param userId - ID do usuário
 * @param existingWorkspaces - Workspaces existentes do usuário (opcional, busca se não fornecido)
 * @param userPlan - Plano do usuário (opcional, assume FREE se não fornecido)
 * @returns WorkspaceLimitResult indicando se pode criar e motivo se não puder
 */
export async function enforceSingleFreeWorkspace(
  userId: string,
  existingWorkspaces?: Workspace[],
  userPlan: UserPlan = "free"
): Promise<WorkspaceLimitResult> {
  if (!userId?.trim()) {
    return {
      allowed: false,
      reason: "INVALID_USER",
      suggestion: "Usuário inválido",
    };
  }

  // Enterprise pode ter workspaces ilimitados
  if (userPlan === "enterprise") {
    return { allowed: true };
  }

  // Buscar workspaces se não fornecidos
  let workspaces = existingWorkspaces;
  if (!workspaces) {
    workspaces = await prisma.workspace.findMany({
      where: {
        createdById: userId,
        status: "ACTIVE",
      },
    });
  }

  // Pro pode ter até 3 workspaces
  if (userPlan === "pro") {
    const count = workspaces.length;
    if (count >= 3) {
      return {
        allowed: false,
        reason: "LIMIT_REACHED_PRO",
        suggestion:
          "Você atingiu o limite de 3 workspaces no plano Pro. Faça upgrade para Enterprise para workspaces ilimitados.",
      };
    }
    return { allowed: true };
  }

  // Free: apenas 1 workspace
  const hasFreeWorkspace = workspaces.length > 0;

  if (hasFreeWorkspace) {
    return {
      allowed: false,
      reason: "FREE_LIMIT_REACHED",
      suggestion:
        "Usuários do plano Free podem ter apenas 1 workspace. Faça upgrade para Pro para criar até 3 workspaces.",
    };
  }

  return { allowed: true };
}

/**
 * Helper para obter o plano do usuário baseado na subscription
 * 
 * @param userId - ID do usuário
 * @returns Plano do usuário (free, pro, enterprise)
 */
export async function getUserPlan(userId: string): Promise<UserPlan> {
  if (!userId?.trim()) {
    return "free";
  }

  try {
    // Buscar workspace do usuário e sua subscription
    const workspace = await prisma.workspace.findFirst({
      where: {
        createdById: userId,
        status: "ACTIVE",
      },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!workspace?.subscription?.plan) {
      return "free";
    }

    // Mapear código do plano para tipo
    const planCode = workspace.subscription.plan.code.toLowerCase();
    if (planCode.includes("enterprise")) {
      return "enterprise";
    }
    if (planCode.includes("pro")) {
      return "pro";
    }

    return "free";
  } catch (error) {
    console.error("[getUserPlan] Error:", error);
    return "free";
  }
}
