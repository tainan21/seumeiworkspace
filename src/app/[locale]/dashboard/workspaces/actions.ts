"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "~/lib/server/auth/session";
import { WorkspaceType, WorkspaceCategory } from "@prisma/client";
import * as WorkspaceService from "~/domains/workspace/services/workspace.service";
import {
    type ActionResult,
} from "~/lib/server/action-utils";
import {
    validateRequired,
    generateSlug,
    sanitizeString,
} from "~/lib/utils/validation";

/**
 * Payload para criação de workspace
 */
export interface CreateWorkspacePayload {
    name: string;
    slug?: string;
    description?: string;
    type?: WorkspaceType;
    category?: WorkspaceCategory;
}

/**
 * Cria um novo workspace com member e wallet
 *
 * @param payload - Dados do workspace
 * @returns ID do workspace criado
 */
export async function createWorkspace(
    payload: CreateWorkspacePayload
): Promise<ActionResult<{ workspaceSlug: string; workspaceId: string }>> {
    try {
        const { user } = await getCurrentSession();

        if (!user?.id) {
            return {
                success: false,
                error: "Usuário não autenticado",
            };
        }

        // Validar entrada
        validateRequired(payload as unknown as Record<string, unknown>, ["name"]);

        // Sanitizar dados
        const sanitizedName = sanitizeString(payload.name);
        const sanitizedDescription = payload.description
            ? sanitizeString(payload.description)
            : undefined;

        // Gerar slug se não fornecido
        const slug = payload.slug
            ? generateSlug(payload.slug)
            : generateSlug(sanitizedName);

        // Criar workspace usando o service
        const result = await WorkspaceService.createWorkspace({
            name: sanitizedName,
            slug,
            description: sanitizedDescription,
            type: payload.type,
            category: payload.category,
            createdById: user.id,
        });

        // Revalidar cache
        revalidatePath("/dashboard/workspaces");

        return {
            success: true,
            data: {
                workspaceSlug: result.workspace.slug,
                workspaceId: result.workspace.id,
            },
        };
    } catch (error) {
        console.error("[createWorkspace] Error:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Erro ao criar workspace. Tente novamente.",
        };
    }
}

/**
 * Busca todos os workspaces do usuário autenticado
 *
 * @returns Array de workspaces
 */
export async function getWorkspaces() {
    try {
        const { user } = await getCurrentSession();

        if (!user?.id) {
            return [];
        }

        const workspaces = await WorkspaceService.getWorkspacesByUserId(user.id);
        return workspaces;
    } catch (error) {
        console.error("[getWorkspaces] Error:", error);
        return [];
    }
}

/**
 * Busca workspace por slug
 *
 * @param slug - Slug do workspace
 * @returns Workspace ou null se não encontrado
 */
export async function getWorkspaceBySlug(slug: string) {
    try {
        if (!slug?.trim()) {
            return null;
        }

        const { user } = await getCurrentSession();

        if (!user?.id) {
            return null;
        }

        const workspace = await WorkspaceService.getWorkspaceBySlug(slug);

        if (!workspace) {
            return null;
        }

        // Verificar se usuário é membro
        const isMember = await WorkspaceService.isUserMemberOfWorkspace(
            user.id,
            workspace.id
        );

        if (!isMember) {
            return null;
        }

        return workspace;
    } catch (error) {
        console.error("[getWorkspaceBySlug] Error:", error);
        return null;
    }
}

/**
 * Atualiza informações do workspace
 *
 * @param id - ID do workspace
 * @param payload - Dados para atualizar
 */
export async function updateWorkspace(
    id: string,
    payload: {
        name?: string;
        description?: string;
        category?: WorkspaceCategory;
    }
): Promise<ActionResult<void>> {
    try {
        if (!id?.trim()) {
            return {
                success: false,
                error: "ID do workspace é obrigatório",
            };
        }

        const { user } = await getCurrentSession();

        if (!user?.id) {
            return {
                success: false,
                error: "Usuário não autenticado",
            };
        }

        // Verificar se usuário é OWNER ou ADMIN
        const role = await WorkspaceService.getUserRoleInWorkspace(user.id, id);

        if (role !== "OWNER" && role !== "ADMIN") {
            return {
                success: false,
                error: "Sem permissão para editar este workspace",
            };
        }

        // Sanitizar dados
        const sanitizedPayload: typeof payload = {};
        if (payload.name) {
            sanitizedPayload.name = sanitizeString(payload.name);
        }
        if (payload.description) {
            sanitizedPayload.description = sanitizeString(payload.description);
        }
        if (payload.category) {
            sanitizedPayload.category = payload.category;
        }

        await WorkspaceService.updateWorkspace(id, sanitizedPayload);

        revalidatePath("/dashboard/workspaces");
        revalidatePath(`/[workspace]`, "page");

        return {
            success: true,
            data: undefined,
        };
    } catch (error) {
        console.error("[updateWorkspace] Error:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Erro ao atualizar workspace. Tente novamente.",
        };
    }
}

/**
 * Verifica se um slug está disponível
 *
 * @param slug - Slug a verificar
 * @returns true se disponível, false caso contrário
 */
export async function checkSlugAvailability(slug: string): Promise<boolean> {
    try {
        if (!slug?.trim()) {
            return false;
        }

        const normalizedSlug = generateSlug(slug);
        return await WorkspaceService.isSlugUnique(normalizedSlug);
    } catch (error) {
        console.error("[checkSlugAvailability] Error:", error);
        return false;
    }
}

/**
 * Gera um slug único baseado no nome
 *
 * @param name - Nome do workspace
 * @returns Slug único gerado
 */
export async function generateSlugFromName(name: string): Promise<string> {
    try {
        if (!name?.trim()) {
            throw new Error("Nome é obrigatório");
        }

        const baseSlug = generateSlug(name);
        return await WorkspaceService.generateUniqueSlug(baseSlug);
    } catch (error) {
        console.error("[generateSlugFromName] Error:", error);
        throw new Error("Erro ao gerar slug");
    }
}
