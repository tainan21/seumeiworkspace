import { prisma } from "~/lib/server/db";
import type { OnboardingCompletion, Workspace } from "@prisma/client";

export interface OnboardingState {
    isCompleted: boolean;
    currentStep: number;
    completedSteps: number[];
    workspaceId: string;
}

/**
 * Busca o progresso atual do onboarding
 */
export async function getOnboardingProgress(
    workspaceId: string
): Promise<OnboardingCompletion | null> {
    if (!workspaceId?.trim()) return null;

    return prisma.onboardingCompletion.findUnique({
        where: { workspaceId },
    });
}

/**
 * Inicializa ou recupera o progresso do onboarding
 */
export async function getOrInitializeOnboarding(
    workspaceId: string
): Promise<OnboardingCompletion> {
    if (!workspaceId?.trim()) {
        throw new Error("Workspace ID é obrigatório");
    }

    const existing = await getOnboardingProgress(workspaceId);

    if (existing) {
        return existing;
    }

    // Se não existir, cria um novo
    return prisma.onboardingCompletion.create({
        data: {
            workspaceId,
            flowId: "default",
            currentStep: 1, // Começa no passo 1
            completedSteps: [],
            isCompleted: false,
        },
    });
}

/**
 * Atualiza o passo atual
 */
export async function updateCurrentStep(
    workspaceId: string,
    step: number
): Promise<OnboardingCompletion> {
    return prisma.onboardingCompletion.update({
        where: { workspaceId },
        data: { currentStep: step },
    });
}

/**
 * Marca um passo como completo e avança para o próximo
 */
export async function completeStep(
    workspaceId: string,
    stepCompleted: number,
    nextStep: number
): Promise<OnboardingCompletion> {
    const current = await getOnboardingProgress(workspaceId);

    if (!current) {
        throw new Error("Onboarding não iniciado");
    }

    // Adiciona ao array de steps completados se não estiver lá
    const completedSteps = current.completedSteps as number[];
    if (!completedSteps.includes(stepCompleted)) {
        completedSteps.push(stepCompleted);
    }

    return prisma.onboardingCompletion.update({
        where: { workspaceId },
        data: {
            completedSteps,
            currentStep: nextStep,
        },
    });
}

/**
 * Finaliza o onboarding completamente
 */
export async function completeOnboarding(
    workspaceId: string
): Promise<OnboardingCompletion> {
    return prisma.onboardingCompletion.update({
        where: { workspaceId },
        data: {
            isCompleted: true,
            completedAt: new Date(),
        },
    });
}
