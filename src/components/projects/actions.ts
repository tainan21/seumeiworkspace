"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "~/lib/server/auth/session";
import * as ProjectService from "~/domains/projects/services/project.service";

/**
 * Cria um novo projeto
 */
export async function createProjectAction(
  workspaceId: string,
  data: { name: string; domain?: string }
) {
  try {
    const { user } = await getCurrentSession();

    if (!user?.id) {
      return { success: false, error: "Usuário não autenticado" };
    }

    if (!workspaceId?.trim()) {
      return { success: false, error: "Workspace ID é obrigatório" };
    }

    // Validar entrada
    if (!data.name?.trim()) {
      return { success: false, error: "Nome do projeto é obrigatório" };
    }

    // Criar projeto
    const project = await ProjectService.createProject({
      name: data.name,
      domain: data.domain,
      workspaceId,
      createdById: user.id,
    });

    // Revalidar cache
    revalidatePath(`/${workspaceId}/projects`);

    return {
      success: true,
      projectId: project.id,
    };
  } catch (error) {
    console.error("[createProjectAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao criar projeto",
    };
  }
}

/**
 * Atualiza um projeto
 */
export async function updateProjectAction(
  workspaceId: string,
  projectId: string,
  data: { name?: string; domain?: string }
) {
  try {
    const { user } = await getCurrentSession();

    if (!user?.id) {
      return { success: false, error: "Usuário não autenticado" };
    }

    if (!workspaceId?.trim() || !projectId?.trim()) {
      return {
        success: false,
        error: "Workspace ID e Project ID são obrigatórios",
      };
    }

    // Atualizar projeto
    await ProjectService.updateProject(workspaceId, projectId, data);

    // Revalidar cache
    revalidatePath(`/${workspaceId}/projects`);
    revalidatePath(`/${workspaceId}/projects/${projectId}`);

    return { success: true };
  } catch (error) {
    console.error("[updateProjectAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao atualizar projeto",
    };
  }
}

/**
 * Deleta um projeto
 */
export async function deleteProjectAction(
  workspaceId: string,
  projectId: string
) {
  try {
    const { user } = await getCurrentSession();

    if (!user?.id) {
      return { success: false, error: "Usuário não autenticado" };
    }

    if (!workspaceId?.trim() || !projectId?.trim()) {
      return {
        success: false,
        error: "Workspace ID e Project ID são obrigatórios",
      };
    }

    // Deletar projeto
    await ProjectService.deleteProject(workspaceId, projectId);

    // Revalidar cache
    revalidatePath(`/${workspaceId}/projects`);

    return { success: true };
  } catch (error) {
    console.error("[deleteProjectAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao deletar projeto",
    };
  }
}
