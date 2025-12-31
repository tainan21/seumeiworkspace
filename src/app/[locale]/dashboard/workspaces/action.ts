"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSession } from "~/lib/server/auth/session";
import { prisma } from "~/lib/server/db";
import { canUserCreateProject } from "~/domains/workspace/limits.server";
import { ProjectLimitError } from "~/domains/workspace/errors";

type Project = NonNullable<
  Awaited<ReturnType<typeof prisma.project.findFirst>>
>;

interface Payload {
  name: string;
  domain: string;
}

/**
 * Cria um novo projeto
 * @param payload - Dados do projeto (name, domain)
 * @throws {ProjectLimitError} Se o limite de projetos foi atingido
 * @throws {Error} Se houver erro ao criar o projeto
 */
export async function createProject(payload: Payload) {
  try {
    const { user } = await getCurrentSession();

    if (!user?.id) {
      throw new Error("Usuário não autenticado");
    }

    // Validar entrada
    if (!payload.name?.trim()) {
      throw new Error("Nome do projeto é obrigatório");
    }

    if (!payload.domain?.trim()) {
      throw new Error("Domínio do projeto é obrigatório");
    }

    // Verificar limite de projetos
    const canCreate = await canUserCreateProject(user.id);
    if (!canCreate) {
      throw new ProjectLimitError();
    }

    // Criar projeto
    await prisma.project.create({
      data: {
        name: payload.name.trim(),
        domain: payload.domain.trim(),
        userId: user.id,
      },
    });

    revalidatePath(`/dashboard/projects`);
  } catch (error) {
    // Re-throw erros conhecidos
    if (error instanceof ProjectLimitError) {
      throw error;
    }

    // Log e re-throw erros inesperados
    console.error("[createProject] Error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Erro ao criar projeto. Tente novamente."
    );
  }
}

/**
 * Verifica se o limite de projetos foi atingido
 * @deprecated Use canUserCreateProject diretamente
 */
export async function checkIfFreePlanLimitReached(): Promise<boolean> {
  try {
    const { user } = await getCurrentSession();

    if (!user?.id) {
      return true; // Se não está autenticado, considera limite atingido
    }

    return !(await canUserCreateProject(user.id));
  } catch (error) {
    console.error("[checkIfFreePlanLimitReached] Error:", error);
    return true; // Em caso de erro, considera limite atingido por segurança
  }
}

/**
 * Busca todos os projetos do usuário autenticado
 * @returns Array de projetos
 */
export async function getProjects(): Promise<NonNullable<Project>[]> {
  try {
    const { user } = await getCurrentSession();

    if (!user?.id) {
      return [];
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return projects;
  } catch (error) {
    console.error("[getProjects] Error:", error);
    return [];
  }
}

/**
 * Busca um projeto pelo ID
 * @param id - ID do projeto
 * @returns Projeto ou null se não encontrado
 */
/**
 * Busca um projeto pelo ID
 * @param id - ID do projeto
 * @returns Projeto ou null se não encontrado
 */
export async function getProjectById(id: string): Promise<Project | null> {
  try {
    if (!id?.trim()) {
      return null;
    }

    const { user } = await getCurrentSession();

    if (!user?.id) {
      return null;
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    return project;
  } catch (error) {
    console.error("[getProjectById] Error:", error);
    return null;
  }
}

/**
 * Atualiza um projeto
 * @param id - ID do projeto
 * @param payload - Dados para atualizar
 * @throws {Error} Se houver erro ao atualizar
 */
export async function updateProjectById(id: string, payload: Payload) {
  try {
    if (!id?.trim()) {
      throw new Error("ID do projeto é obrigatório");
    }

    const { user } = await getCurrentSession();

    if (!user?.id) {
      throw new Error("Usuário não autenticado");
    }

    // Validar entrada
    if (!payload.name?.trim()) {
      throw new Error("Nome do projeto é obrigatório");
    }

    if (!payload.domain?.trim()) {
      throw new Error("Domínio do projeto é obrigatório");
    }

    await prisma.project.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        name: payload.name.trim(),
        domain: payload.domain.trim(),
      },
    });

    revalidatePath(`/dashboard/projects`);
  } catch (error) {
    console.error("[updateProjectById] Error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Erro ao atualizar projeto. Tente novamente."
    );
  }
}

/**
 * Deleta um projeto
 * @param id - ID do projeto
 * @throws {Error} Se houver erro ao deletar
 */
export async function deleteProjectById(id: string) {
  try {
    if (!id?.trim()) {
      throw new Error("ID do projeto é obrigatório");
    }

    const { user } = await getCurrentSession();

    if (!user?.id) {
      throw new Error("Usuário não autenticado");
    }

    await prisma.project.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    revalidatePath(`/dashboard/projects`);
    redirect("/dashboard/projects");
  } catch (error) {
    console.error("[deleteProjectById] Error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Erro ao deletar projeto. Tente novamente."
    );
  }
}
