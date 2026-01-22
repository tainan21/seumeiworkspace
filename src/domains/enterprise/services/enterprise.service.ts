import { prisma } from "~/lib/server/db";
import type { Enterprise } from "@prisma/client";
import { EnterpriseType, EnterpriseDocumentType } from "@prisma/client";
import * as OnboardingCache from "~/lib/cache/onboarding-cache";

export interface CreateEnterprisePayload {
    name: string; // legalName (obrigatório)
    fantasyName?: string; // tradeName
    document?: string; // CNPJ/CPF (opcional)
    email?: string;
    phone?: string;
    website?: string;
    workspaceId: string;
    isMain?: boolean;
    type?: EnterpriseType; // AUTONOMO ou EMPRESA
    segment?: string;
    subSegment?: string;
    address?: {
        street?: string;
        number?: string;
        complement?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
        zipCode?: string; // CEP
    };
}

/**
 * Cria uma nova empresa (Enterprise)
 * Se não conseguir salvar no banco, armazena no cache e prossegue
 */
export async function createEnterprise(
    payload: CreateEnterprisePayload
): Promise<Enterprise> {
    // Validações básicas - apenas razão social é obrigatória
    if (!payload.name?.trim()) throw new Error("Razão Social é obrigatória");
    if (!payload.workspaceId?.trim()) throw new Error("Workspace ID é obrigatório");

    // Determinar tipo de documento (se fornecido)
    let cleanDocument: string | null = null;
    let documentType: EnterpriseDocumentType = "NONE";
    
    if (payload.document?.trim()) {
        cleanDocument = payload.document.replace(/\D/g, "");
        documentType = 
            cleanDocument.length === 11 ? "CPF" : 
            cleanDocument.length === 14 ? "CNPJ" : 
            "NONE";
    }

    // Se for empresa principal, verificar se já existe uma empresa principal no workspace
    if (payload.isMain) {
        const existingMainEnterprise = await getMainEnterprise(payload.workspaceId);
        if (existingMainEnterprise) {
            // Se já existe empresa principal, atualizar ao invés de criar
            return updateEnterprise(existingMainEnterprise.id, payload);
        }
    }

    // Verificar se já existe uma empresa com o mesmo documento (se fornecido)
    let existingEnterprise: { id: string; workspaceId: string; isMain: boolean } | null = null;
    
    if (cleanDocument) {
        try {
            existingEnterprise = await prisma.enterprise.findUnique({
                where: { document: cleanDocument },
                select: { id: true, workspaceId: true, isMain: true },
            });
        } catch (error) {
            // Se houver erro ao buscar, continuar normalmente
            console.warn("[createEnterprise] Erro ao buscar empresa existente:", error);
        }

        // Se já existe e é do mesmo workspace, atualizar ao invés de criar
        if (existingEnterprise && existingEnterprise.workspaceId === payload.workspaceId) {
            // Atualizar empresa existente do mesmo workspace
            return updateEnterprise(existingEnterprise.id, payload);
        }
    }

    // Determinar tipo de empresa (default: EMPRESA se CNPJ, AUTONOMO se CPF)
    const type: EnterpriseType = payload.type || 
        (documentType === "CPF" ? "AUTONOMO" : "EMPRESA");

    // Trade name é obrigatório no schema, usar name se não fornecido
    const tradeName = payload.fantasyName?.trim() || payload.name.trim();

    // Segment é obrigatório, usar "Geral" como default
    const segment = payload.segment?.trim() || "Geral";

    // Preparar endereço como JSON (todos os campos opcionais)
    const address = payload.address && (
        payload.address.street || 
        payload.address.number || 
        payload.address.neighborhood || 
        payload.address.city || 
        payload.address.state || 
        payload.address.zipCode
    ) ? {
        street: payload.address.street || null,
        number: payload.address.number || null,
        complement: payload.address.complement || null,
        neighborhood: payload.address.neighborhood || null,
        city: payload.address.city || null,
        state: payload.address.state || null,
        zipCode: payload.address.zipCode || null,
    } : null;

    // Preparar contato como JSON (obrigatório)
    const contact = {
        email: payload.email || null,
        phone: payload.phone || null,
        website: payload.website || null,
    };

    try {
        const enterprise = await prisma.enterprise.create({
            data: {
                type,
                legalName: payload.name,
                tradeName,
                document: cleanDocument,
                documentType,
                segment,
                subSegment: payload.subSegment,
                workspaceId: payload.workspaceId,
                isMain: payload.isMain ?? false,
                address: address as any,
                contact: contact as any,
            },
        });

        // Se for empresa principal, vincular ao workspace
        if (payload.isMain) {
            await prisma.workspace.update({
                where: { id: payload.workspaceId },
                data: {
                    enterpriseMotherId: enterprise.id,
                },
            });
        }

        // Limpar cache se existir
        await OnboardingCache.clearCachedEnterpriseData(payload.workspaceId);

        return enterprise;
    } catch (error: any) {
        console.error("[createEnterprise] Erro ao salvar no banco:", error);
        
        // Se não conseguir salvar, armazenar no cache e prosseguir
        if (payload.isMain) {
            try {
                await OnboardingCache.cacheEnterpriseData(payload.workspaceId, {
                    name: payload.name,
                    fantasyName: payload.fantasyName,
                    document: cleanDocument || undefined,
                    email: payload.email,
                    phone: payload.phone,
                    address: payload.address,
                });

                console.warn(
                    `[createEnterprise] Não foi possível salvar no banco. ` +
                    `Dados armazenados no cache para recuperação posterior. ` +
                    `Erro: ${error.message}`
                );

                // Retornar um objeto Enterprise "mock" para permitir continuar o onboarding
                // O usuário poderá tentar salvar novamente depois
                return {
                    id: `cached-${Date.now()}`,
                    workspaceId: payload.workspaceId,
                    type,
                    legalName: payload.name,
                    tradeName,
                    document: cleanDocument,
                    documentType,
                    segment,
                    subSegment: payload.subSegment,
                    isMain: payload.isMain ?? false,
                    isActive: true,
                    address: address as any,
                    contact: contact as any,
                    createdById: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as Enterprise;
            } catch (cacheError) {
                console.error("[createEnterprise] Erro ao salvar no cache:", cacheError);
                // Se nem o cache funcionar, lançar erro original
                throw new Error(
                    `Não foi possível salvar os dados. Erro: ${error.message}. ` +
                    `Por favor, tente novamente mais tarde.`
                );
            }
        }

        // Se não for empresa principal, lançar erro normalmente
        throw error;
    }
}

/**
 * Busca a empresa principal do workspace
 */
export async function getMainEnterprise(workspaceId: string): Promise<Enterprise | null> {
    return prisma.enterprise.findFirst({
        where: {
            workspaceId,
            isMain: true,
        },
    });
}

/**
 * Atualiza uma empresa
 */
export async function updateEnterprise(
    id: string,
    data: Partial<CreateEnterprisePayload>
): Promise<Enterprise> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.legalName = data.name;
    if (data.fantasyName !== undefined) updateData.tradeName = data.fantasyName;
    if (data.document !== undefined) {
        updateData.document = data.document.replace(/\D/g, "");
        const cleanDocument = updateData.document;
        updateData.documentType = 
            cleanDocument.length === 11 ? "CPF" : 
            cleanDocument.length === 14 ? "CNPJ" : 
            "NONE";
    }
    if (data.type !== undefined) updateData.type = data.type;
    if (data.segment !== undefined) updateData.segment = data.segment;
    if (data.subSegment !== undefined) updateData.subSegment = data.subSegment;
    if (data.isMain !== undefined) updateData.isMain = data.isMain;

    // Atualizar contato
    if (data.email !== undefined || data.phone !== undefined || data.website !== undefined) {
        const existing = await prisma.enterprise.findUnique({
            where: { id },
            select: { contact: true },
        });
        const existingContact = (existing?.contact as any) || {};
        updateData.contact = {
            email: data.email !== undefined ? data.email : existingContact.email,
            phone: data.phone !== undefined ? data.phone : existingContact.phone,
            website: data.website !== undefined ? data.website : existingContact.website,
        };
    }

    // Atualizar endereço
    if (data.address !== undefined) {
        updateData.address = {
            street: data.address.street,
            number: data.address.number,
            complement: data.address.complement,
            neighborhood: data.address.neighborhood,
            city: data.address.city,
            state: data.address.state,
            zipCode: data.address.zipCode,
        };
    }

    const updated = await prisma.enterprise.update({
        where: { id },
        data: updateData,
    });

    // Se for empresa principal, garantir que está vinculada ao workspace
    if (data.isMain && data.workspaceId) {
        await prisma.workspace.update({
            where: { id: data.workspaceId },
            data: {
                enterpriseMotherId: updated.id,
            },
        });
    }

    return updated;
}
