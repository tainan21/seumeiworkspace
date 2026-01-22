"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "~/lib/server/auth/session";
import * as FeaturesService from "~/domains/features";
import { FeatureSource } from "@prisma/client";

/**
 * Ativa uma feature no workspace
 */
export async function activateFeatureAction(
  workspaceId: string,
  featureCode: string,
  source: FeatureSource = "STORE"
) {
  try {
    const { user } = await getCurrentSession();

    if (!user?.id) {
      return { success: false, error: "Usuário não autenticado" };
    }

    if (!workspaceId?.trim() || !featureCode?.trim()) {
      return {
        success: false,
        error: "Workspace ID e Feature Code são obrigatórios",
      };
    }

    // Ativar feature
    await FeaturesService.activateFeature(workspaceId, featureCode, source);

    // Revalidar cache
    revalidatePath(`/${workspaceId}/apps`);

    return { success: true };
  } catch (error) {
    console.error("[activateFeatureAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao ativar feature",
    };
  }
}

/**
 * Compra uma feature com coins
 */
export async function purchaseFeatureAction(
  workspaceId: string,
  featureCode: string,
  price: number
) {
  try {
    const { user } = await getCurrentSession();

    if (!user?.id) {
      return { success: false, error: "Usuário não autenticado" };
    }

    if (!workspaceId?.trim() || !featureCode?.trim()) {
      return {
        success: false,
        error: "Workspace ID e Feature Code são obrigatórios",
      };
    }

    if (price <= 0) {
      return { success: false, error: "Preço inválido" };
    }

    // Comprar e ativar feature
    await FeaturesService.purchaseFeatureWithCoins(
      workspaceId,
      featureCode,
      price
    );

    // Revalidar cache
    revalidatePath(`/${workspaceId}/apps`);

    return { success: true };
  } catch (error) {
    console.error("[purchaseFeatureAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao comprar feature",
    };
  }
}

/**
 * Desativa uma feature
 */
export async function deactivateFeatureAction(
  workspaceId: string,
  featureCode: string
) {
  try {
    const { user } = await getCurrentSession();

    if (!user?.id) {
      return { success: false, error: "Usuário não autenticado" };
    }

    if (!workspaceId?.trim() || !featureCode?.trim()) {
      return {
        success: false,
        error: "Workspace ID e Feature Code são obrigatórios",
      };
    }

    // Desativar feature
    await FeaturesService.deactivateFeature(workspaceId, featureCode);

    // Revalidar cache
    revalidatePath(`/${workspaceId}/apps`);

    return { success: true };
  } catch (error) {
    console.error("[deactivateFeatureAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao desativar feature",
    };
  }
}
