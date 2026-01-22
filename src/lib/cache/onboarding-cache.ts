"use server";

import { prisma } from "~/lib/server/db";
import { z } from "zod";
import { EnterpriseType, EnterpriseDocumentType } from "@prisma/client";

/**
 * Schema de validação para dados de empresa
 * Apenas razão social é obrigatória
 */
const EnterpriseDataSchema = z.object({
    name: z.string().min(1, "Razão social é obrigatória"),
    fantasyName: z.string().optional(),
    document: z.string().optional(),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.object({
        zipCode: z.string().optional(),
        street: z.string().optional(),
        number: z.string().optional(),
        complement: z.string().optional(),
        neighborhood: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
    }).optional(),
});

type EnterpriseData = z.infer<typeof EnterpriseDataSchema>;

interface CachedEnterpriseData {
    workspaceId: string;
    name: string;
    fantasyName?: string;
    document?: string;
    email?: string;
    phone?: string;
    address?: {
        zipCode?: string;
        street?: string;
        number?: string;
        complement?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
    };
    createdAt: Date;
}

interface WorkspaceSettings {
    cachedEnterpriseData?: {
        name: string;
        fantasyName?: string;
        document?: string;
        email?: string;
        phone?: string;
        address?: {
            zipCode?: string;
            street?: string;
            number?: string;
            complement?: string;
            neighborhood?: string;
            city?: string;
            state?: string;
        };
        createdAt: string;
    };
    [key: string]: unknown;
}

/**
 * Valida documento (CPF/CNPJ)
 */
function validateDocument(doc: string): boolean {
    if (!doc) return false;
    
    const cleaned = doc.replace(/[^\dA-Z]/gi, "");
    
    // CPF: 11 dígitos
    if (cleaned.length === 11) {
        return validateCPF(cleaned);
    }
    
    // CNPJ: 14 caracteres (numérico ou alfanumérico a partir de 2026)
    if (cleaned.length === 14) {
        return validateCNPJ(cleaned);
    }
    
    return false;
}

function validateCPF(cpf: string): boolean {
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    
    return digit === parseInt(cpf.charAt(10));
}

function validateCNPJ(cnpj: string): boolean {
    // Suporte a CNPJ alfanumérico (2026+) e numérico tradicional
    const isNumeric = /^\d{14}$/.test(cnpj);
    const isAlphanumeric = /^[0-9A-Z]{14}$/i.test(cnpj);
    
    if (!isNumeric && !isAlphanumeric) return false;
    
    // Para CNPJ numérico, validar dígitos verificadores
    if (isNumeric) {
        if (/^(\d)\1+$/.test(cnpj)) return false;
        
        const calcDigit = (base: string, weights: number[]): number => {
            const sum = base.split("").reduce((acc, char, idx) => {
                return acc + parseInt(char) * weights[idx];
            }, 0);
            const remainder = sum % 11;
            return remainder < 2 ? 0 : 11 - remainder;
        };
        
        const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        
        const base1 = cnpj.substring(0, 12);
        const digit1 = calcDigit(base1, weights1);
        
        if (digit1 !== parseInt(cnpj.charAt(12))) return false;
        
        const base2 = cnpj.substring(0, 13);
        const digit2 = calcDigit(base2, weights2);
        
        return digit2 === parseInt(cnpj.charAt(13));
    }
    
    // CNPJ alfanumérico é válido se tiver 14 caracteres
    return true;
}

/**
 * Armazena dados de empresa com fallback para cache
 * Tenta salvar no banco, se falhar, armazena no cache
 */
export async function saveEnterpriseData(
    workspaceId: string,
    data: EnterpriseData
): Promise<{ success: boolean; usedCache: boolean; error?: string }> {
    try {
        // Validação dos dados
        const validationResult = EnterpriseDataSchema.safeParse(data);
        if (!validationResult.success) {
            return {
                success: false,
                usedCache: false,
                error: validationResult.error.errors[0]?.message || "Dados inválidos",
            };
        }
        
        // Validar documento se fornecido
        if (data.document && !validateDocument(data.document)) {
            return {
                success: false,
                usedCache: false,
                error: "CPF/CNPJ inválido",
            };
        }
        
        const validatedData = validationResult.data;
        
        // Determinar tipo de documento (se fornecido)
        let cleanDocument: string | null = null;
        let documentType: EnterpriseDocumentType = "NONE";
        
        if (validatedData.document?.trim()) {
            cleanDocument = validatedData.document.replace(/\D/g, "");
            if (cleanDocument) {
                documentType = 
                    cleanDocument.length === 11 ? "CPF" : 
                    cleanDocument.length === 14 ? "CNPJ" : 
                    "NONE";
            }
        }

        // Determinar tipo de empresa (default: EMPRESA se CNPJ, AUTONOMO se CPF)
        const type: EnterpriseType = documentType === "CPF" ? "AUTONOMO" : "EMPRESA";

        // Trade name é obrigatório no schema, usar name se não fornecido
        const tradeName = validatedData.fantasyName?.trim() || validatedData.name.trim();

        // Segment é obrigatório, usar "Geral" como default
        const segment = "Geral";

        // Preparar contato como JSON (obrigatório)
        const contact = {
            email: validatedData.email || null,
            phone: validatedData.phone || null,
        };

        // Preparar endereço como JSON (opcional)
        const address = validatedData.address || null;
        
        // Tentar salvar no banco de dados principal
        try {
            await prisma.enterprise.create({
                data: {
                    workspaceId,
                    type,
                    legalName: validatedData.name,
                    tradeName,
                    document: cleanDocument,
                    documentType,
                    segment,
                    contact: contact as any,
                    address: address as any,
                },
            });
            
            // Limpar cache se salvou com sucesso
            await clearCachedEnterpriseData(workspaceId);
            
            return { success: true, usedCache: false };
        } catch (dbError) {
            console.warn("[saveEnterpriseData] DB save failed, using cache:", dbError);
            
            // Fallback: salvar no cache
            await cacheEnterpriseData(workspaceId, validatedData);
            
            return { success: true, usedCache: true };
        }
    } catch (error) {
        console.error("[saveEnterpriseData] Error:", error);
        return {
            success: false,
            usedCache: false,
            error: error instanceof Error ? error.message : "Erro desconhecido",
        };
    }
}

/**
 * Armazena dados de empresa no cache (usando settings do workspace)
 */
export async function cacheEnterpriseData(
    workspaceId: string,
    data: EnterpriseData
): Promise<void> {
    try {
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { settings: true },
        });

        const settings = (workspace?.settings as WorkspaceSettings) || {};
        const cachedData = {
            name: data.name,
            fantasyName: data.fantasyName,
            document: data.document,
            email: data.email,
            phone: data.phone,
            address: data.address,
            createdAt: new Date().toISOString(),
        };

        settings.cachedEnterpriseData = cachedData;

        await prisma.workspace.update({
            where: { id: workspaceId },
            data: { settings: settings as any },
        });
    } catch (error) {
        console.error("[cacheEnterpriseData] Error:", error);
        throw error;
    }
}

/**
 * Recupera dados de empresa do cache
 */
export async function getCachedEnterpriseData(
    workspaceId: string
): Promise<CachedEnterpriseData | null> {
    try {
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { settings: true },
        });

        const settings = (workspace?.settings as WorkspaceSettings) || {};
        const cached = settings.cachedEnterpriseData;

        if (!cached) return null;

        const result: CachedEnterpriseData = {
            workspaceId,
            name: cached.name,
            fantasyName: cached.fantasyName,
            document: cached.document,
            email: cached.email,
            phone: cached.phone,
            address: cached.address,
            createdAt: new Date(cached.createdAt),
        };
        
        return result;
    } catch (error) {
        console.error("[getCachedEnterpriseData] Error:", error);
        return null;
    }
}

/**
 * Limpa dados de empresa do cache
 */
export async function clearCachedEnterpriseData(workspaceId: string): Promise<void> {
    try {
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { settings: true },
        });

        const settings = (workspace?.settings as WorkspaceSettings) || {};
        delete settings.cachedEnterpriseData;

        await prisma.workspace.update({
            where: { id: workspaceId },
            data: { settings: settings as any },
        });
    } catch (error) {
        console.error("[clearCachedEnterpriseData] Error:", error);
        // Não lançar erro, apenas logar
    }
}

/**
 * Tenta migrar dados do cache para o banco de dados
 * Útil para executar em background ou retry
 */
export async function migrateCachedData(workspaceId: string): Promise<boolean> {
    try {
        const cached = await getCachedEnterpriseData(workspaceId);
        if (!cached) return false;
        
        // Determinar tipo de documento (se fornecido)
        let cleanDocument: string | null = null;
        let documentType: EnterpriseDocumentType = "NONE";
        
        if (cached.document?.trim()) {
            cleanDocument = cached.document.replace(/\D/g, "");
            if (cleanDocument) {
                documentType = 
                    cleanDocument.length === 11 ? "CPF" : 
                    cleanDocument.length === 14 ? "CNPJ" : 
                    "NONE";
            }
        }

        // Determinar tipo de empresa (default: EMPRESA se CNPJ, AUTONOMO se CPF)
        const type: EnterpriseType = documentType === "CPF" ? "AUTONOMO" : "EMPRESA";

        // Trade name é obrigatório no schema, usar name se não fornecido
        const tradeName = cached.fantasyName?.trim() || cached.name.trim();

        // Segment é obrigatório, usar "Geral" como default
        const segment = "Geral";

        // Preparar contato como JSON (obrigatório)
        const contact = {
            email: cached.email || null,
            phone: cached.phone || null,
        };

        // Preparar endereço como JSON (opcional)
        const address = cached.address || null;
        
        await prisma.enterprise.create({
            data: {
                workspaceId,
                type,
                legalName: cached.name,
                tradeName,
                document: cleanDocument,
                documentType,
                segment,
                contact: contact as any,
                address: address as any,
            },
        });
        
        await clearCachedEnterpriseData(workspaceId);
        return true;
    } catch (error) {
        console.error("[migrateCachedData] Error:", error);
        return false;
    }
}
