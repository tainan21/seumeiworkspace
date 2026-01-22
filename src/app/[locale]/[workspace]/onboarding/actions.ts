"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "~/lib/server/auth/session";
import * as OnboardingService from "~/domains/onboarding/services/onboarding.service";
import * as EnterpriseService from "~/domains/enterprise/services/enterprise.service";
import * as WorkspaceService from "~/domains/workspace/services/workspace.service";
import * as ThemeService from "~/domains/theme/theme-service";
import * as ProductService from "~/domains/product/services/product.service";
import * as WalletService from "~/domains/workspace/services/wallet.service";

/**
 * Busca o estado atual do onboarding
 */
export async function getOnboardingState(workspaceSlug: string) {
    try {
        const { user } = await getCurrentSession();
        if (!user) throw new Error("Não autenticado");

        const workspace = await WorkspaceService.getWorkspaceBySlug(workspaceSlug);
        if (!workspace) throw new Error("Workspace não encontrado");

        // Verificar acesso
        const isMember = await WorkspaceService.isUserMemberOfWorkspace(user.id, workspace.id);
        if (!isMember) throw new Error("Sem acesso ao workspace");

        const progress = await OnboardingService.getOrInitializeOnboarding(workspace.id);

        return {
            workspace,
            progress: {
                ...progress,
                completedSteps: (Array.isArray(progress.completedSteps) ? progress.completedSteps : []) as number[],
            },
        };
    } catch (error) {
        console.error("[getOnboardingState] Error:", error);
        throw error;
    }
}

/**
 * Submete o formulário de empresa (Passo 1)
 */
export async function submitEnterpriseStep(workspaceId: string, data: any) {
    try {
        const { user } = await getCurrentSession();
        if (!user) throw new Error("Não autenticado");

        // Validar acesso (pode ser movido para middleware/service)
        const role = await WorkspaceService.getUserRoleInWorkspace(user.id, workspaceId);
        if (role !== "OWNER" && role !== "ADMIN") {
            throw new Error("Permissão insuficiente");
        }

        // Criar empresa (documento e endereço são opcionais)
        await EnterpriseService.createEnterprise({
            workspaceId,
            isMain: true,
            name: data.legalName,
            fantasyName: data.fantasyName,
            document: data.document,
            email: data.email,
            phone: data.phone,
            address: {
                zipCode: data.zipCode,
                street: data.street,
                number: data.number,
                complement: data.complement,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,
            },
        });

        // Atualizar progresso (Passo 1 -> 2)
        await OnboardingService.completeStep(workspaceId, 1, 2);

        revalidatePath(`/${workspaceId}/onboarding`);
        return { success: true };
    } catch (error) {
        console.error("[submitEnterpriseStep] Error:", error);
        throw new Error(error instanceof Error ? error.message : "Erro ao salvar empresa");
    }
}

/**
 * Submete o passo de categoria (Passo 2)
 */
export async function submitCategoryStep(workspaceId: string, category: any) {
    try {
        const { user } = await getCurrentSession();
        if (!user) throw new Error("Não autenticado");

        // Validar permissão (simplificado)
        const role = await WorkspaceService.getUserRoleInWorkspace(user.id, workspaceId);
        if (!role) throw new Error("Sem acesso");

        // Atualizar categoria do workspace
        await WorkspaceService.updateWorkspace(workspaceId, {
            category: category,
        });

        // Atualizar progresso (Passo 2 -> 3)
        await OnboardingService.completeStep(workspaceId, 2, 3);

        revalidatePath(`/${workspaceId}/onboarding`);
        return { success: true };
    } catch (error) {
        console.error("[submitCategoryStep] Error:", error);
        throw new Error("Erro ao salvar categoria");
    }
}

/**
 * Submete o passo de tema (Passo 3)
 */
export async function submitThemeStep(workspaceId: string, preset: string, mode: "light" | "dark") {
    try {
        const { user } = await getCurrentSession();
        if (!user) throw new Error("Não autenticado");

        // Validar permissão
        const role = await WorkspaceService.getUserRoleInWorkspace(user.id, workspaceId);
        if (!role) throw new Error("Sem acesso");

        // Atualizar tema
        await ThemeService.updateThemeConfig(workspaceId, {
            preset: preset as any,
            mode: mode,
        });

        // Atualizar progresso (Passo 3 -> 4)
        await OnboardingService.completeStep(workspaceId, 3, 4);

        revalidatePath(`/${workspaceId}/onboarding`);
        return { success: true };
    } catch (error) {
        console.error("[submitThemeStep] Error:", error);
        throw new Error("Erro ao salvar tema");
    }
}
import * as FeatureService from "~/domains/feature/services/feature.service";

/**
 * Busca features disponíveis (para o passo 4)
 */
export async function getFeatures() {
    return FeatureService.getAvailableFeatures();
}

/**
 * Submete o passo de features (Passo 4)
 */
export async function submitFeaturesStep(workspaceId: string, featureCodes: string[]) {
    try {
        const { user } = await getCurrentSession();
        if (!user) throw new Error("Não autenticado");

        // Validar permissão
        const role = await WorkspaceService.getUserRoleInWorkspace(user.id, workspaceId);
        if (!role) throw new Error("Sem acesso");

        // Ativar features
        await FeatureService.activateFeatures(workspaceId, featureCodes);

        // Atualizar progresso (Passo 4 -> 5)
        await OnboardingService.completeStep(workspaceId, 4, 5);

        revalidatePath(`/${workspaceId}/onboarding`);
        return { success: true };
    } catch (error) {
        console.error("[submitFeaturesStep] Error:", error);
        throw new Error("Erro ao ativar features");
    }
}

/**
 * Submete o último passo (Produto) e finaliza
 */
export async function submitProductAndFinish(workspaceId: string, data: any) {
    try {
        const { user } = await getCurrentSession();
        if (!user) throw new Error("Não autenticado");

        // Validar permissão
        const role = await WorkspaceService.getUserRoleInWorkspace(user.id, workspaceId);
        if (!role) throw new Error("Sem acesso");

        // Criar produto
        await ProductService.createProduct({
            workspaceId,
            name: data.name,
            price: parseFloat(data.price),
            description: data.description,
        });

        // Completar Onboarding
        await OnboardingService.completeOnboarding(workspaceId);

        // Bônus final (500 coins)
        try {
            const wallet = await WalletService.getWalletByWorkspaceId(workspaceId);
            if (wallet) {
                await WalletService.addTransaction({
                    walletId: wallet.id,
                    amount: 500,
                    type: "ONBOARDING_BONUS",
                    description: "Bônus por completar o onboarding",
                });
            }
        } catch (e) {
            console.error("Erro ao adicionar bônus:", e);
        }

        revalidatePath(`/${workspaceId}`); // Revalida dashboard
        return { success: true };
    } catch (error) {
        console.error("[submitProductAndFinish] Error:", error);
        throw new Error("Erro ao finalizar onboarding");
    }
}
