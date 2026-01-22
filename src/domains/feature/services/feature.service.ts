import { prisma } from "~/lib/server/db";
import { FeatureCategory, FeatureSource } from "@prisma/client";

export const DEFAULT_FEATURES = [
    {
        code: "CRM_CORE",
        name: "CRM Básico",
        description: "Gestão de clientes e contatos",
        category: "CORE",
        icon: "Users",
    },
    {
        code: "SALES_CORE",
        name: "Vendas",
        description: "Gestão de pedidos e vendas",
        category: "CORE",
        icon: "ShoppingCart",
    },
    {
        code: "PRODUCTS_CORE",
        name: "Catálogo",
        description: "Gestão de produtos e serviços",
        category: "CORE",
        icon: "Package",
    },
    {
        code: "AI_INSIGHTS",
        name: "Insights IA",
        description: "Análise inteligente do seu negócio",
        category: "AI",
        icon: "Brain",
    },
    {
        code: "AUTO_REPLY",
        name: "Resposta Automática",
        description: "Automação de mensagens",
        category: "AUTOMATION",
        icon: "MessageSquare",
    },
];

/**
 * Garante que as features padrão existam no banco
 */
export async function syncDefaultFeatures() {
    for (const feat of DEFAULT_FEATURES) {
        await prisma.feature.upsert({
            where: { code: feat.code },
            create: {
                code: feat.code,
                name: feat.name,
                description: feat.description,
                category: feat.category as FeatureCategory,
                icon: feat.icon,
                isPublic: true,
            },
            update: {
                name: feat.name,
                description: feat.description,
                category: feat.category as FeatureCategory,
                icon: feat.icon,
            },
        });
    }
}

/**
 * Busca features disponíveis agrupadas por categoria
 */
export async function getAvailableFeatures() {
    // Garantir sync (idealmente seria num script de seed, mas aqui garante funcionalidade)
    await syncDefaultFeatures();

    return prisma.feature.findMany({
        where: { isActive: true, isPublic: true },
        orderBy: { category: "asc" },
    });
}

/**
 * Ativa uma lista de features para o workspace
 */
export async function activateFeatures(
    workspaceId: string,
    featureCodes: string[]
) {
    if (!workspaceId) throw new Error("Workspace ID obrigatório");

    const features = await prisma.feature.findMany({
        where: { code: { in: featureCodes } },
    });

    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(now.getDate() + 7); // 7 dias de trial

    // Usar transaction para ativar todas
    await prisma.$transaction(
        features.map((feat) =>
            prisma.workspaceFeature.upsert({
                where: {
                    workspaceId_featureId: {
                        workspaceId,
                        featureId: feat.id,
                    },
                },
                create: {
                    workspaceId,
                    featureId: feat.id,
                    source: FeatureSource.ONBOARDING,
                    enabled: true,
                    enabledAt: now,
                    expiresAt: expiresAt, // Trial
                },
                update: {
                    enabled: true,
                    // Não atualiza expiresAt se já existir, ou atualiza?
                    // No onboarding, assumimos reset ou criação.
                },
            })
        )
    );
}

/**
 * Busca features ativas do workspace
 */
export async function getWorkspaceFeatures(workspaceId: string) {
    return prisma.workspaceFeature.findMany({
        where: { workspaceId, enabled: true },
        include: { feature: true },
    });
}
