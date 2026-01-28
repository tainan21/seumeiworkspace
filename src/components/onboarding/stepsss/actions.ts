"use server";

import { getCurrentSession } from "~/lib/server/auth/session";
import { enforceSingleFreeWorkspace, getUserPlan } from "~/domains/workspace/rules";
import { assembleMenu } from "~/domains/workspace/assemble-menu";
import { generateRBACDefaults } from "~/domains/rbac";
import { createWorkspace } from "~/app/[locale]/dashboard/workspaces/actions";
import type { OnboardingFormData } from "~/lib/stores/onboarding-store";

/**
 * Cria workspace a partir dos dados do onboarding
 */
export async function createWorkspaceFromOnboarding(
  formData: OnboardingFormData
) {
  try {
    const sessionResult = await getCurrentSession();

    if (!sessionResult.user?.id) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const userId = sessionResult.user.id;

    // 1. Validar limite de workspace
    const userPlan = await getUserPlan(userId);
    const limitCheck = await enforceSingleFreeWorkspace(userId, undefined, userPlan);

    if (!limitCheck.allowed) {
      return {
        success: false,
        error: limitCheck.suggestion || limitCheck.reason,
      };
    }

    // 2. Montar menu
    const menuItems = formData.menuComponents
      ? assembleMenu(
          formData.menuComponents,
          formData.selectedFeatures || []
        )
      : [];

    // 3. Gerar RBAC
    const rbac = generateRBACDefaults({
      ownerId: userId,
      apps: formData.selectedFeatures || [],
    });

    // 4. Criar workspace
    const result = await createWorkspace({
      name: formData.companyName || "Meu Workspace",
      description: `Workspace criado via onboarding`,
      category: "LIVRE", // TODO: Mapear de companyType
    });

    if (result.success) {
      return {
        success: true,
        workspaceSlug: result.data.workspaceSlug,
        workspaceId: result.data.workspaceId,
      };
    } else {
      throw new Error("Falha ao criar workspace");
    }
  } catch (error) {
    console.error("[createWorkspaceFromOnboarding] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao criar workspace",
    };
  }
}
