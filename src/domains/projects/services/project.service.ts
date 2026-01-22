"use server";

import { prisma } from "~/lib/server/db";
import type { Project } from "@prisma/client";

/**
 * Payload para criação de projeto
 */
export interface CreateProjectPayload {
  name: string;
  domain?: string;
  workspaceId: string;
  createdById: string;
}

/**
 * Payload para atualização de projeto
 */
export interface UpdateProjectPayload {
  name?: string;
  domain?: string;
}

/**
 * Filtros para busca de projetos
 */
export interface ProjectFilters {
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Cria um novo projeto no workspace
 * 
 * @param payload - Dados do projeto
 * @returns Projeto criado
 * @throws Error se houver falha na criação
 */
export async function createProject(
  payload: CreateProjectPayload
): Promise<Project> {
  // Validações
  if (!payload.name?.trim()) {
    throw new Error("Nome do projeto é obrigatório");
  }

  if (!payload.workspaceId?.trim()) {
    throw new Error("Workspace ID é obrigatório");
  }

  if (!payload.createdById?.trim()) {
    throw new Error("Criador do projeto é obrigatório");
  }

  // TODO: Validar limite de projetos por workspace/plano
  // Por enquanto, criar diretamente

  // Gerar domain se não fornecido
  const domain =
    payload.domain?.trim() ||
    payload.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // Criar projeto
  const project = await prisma.project.create({
    data: {
      name: payload.name.trim(),
      domain,
      userId: payload.createdById,
      // TODO: Adicionar workspaceId quando schema for atualizado
      // workspaceId: payload.workspaceId,
    },
  });

  return project;
}

/**
 * Busca projeto por ID
 * 
 * @param workspaceId - ID do workspace
 * @param projectId - ID do projeto
 * @returns Projeto ou null se não encontrado
 */
export async function getProjectById(
  workspaceId: string,
  projectId: string
): Promise<Project | null> {
  if (!workspaceId?.trim() || !projectId?.trim()) {
    return null;
  }

  // TODO: Adicionar filtro por workspaceId quando schema for atualizado
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  // TODO: Validar se projeto pertence ao workspace
  return project;
}

/**
 * Busca todos os projetos do workspace
 * 
 * @param workspaceId - ID do workspace
 * @param filters - Filtros opcionais
 * @returns Array de projetos
 */
export async function getProjects(
  workspaceId: string,
  filters?: ProjectFilters
): Promise<Project[]> {
  if (!workspaceId?.trim()) {
    return [];
  }

  // TODO: Adicionar filtro por workspaceId quando schema for atualizado
  const projects = await prisma.project.findMany({
    where: {
      // TODO: Adicionar workspaceId quando schema for atualizado
      // workspaceId,
      ...(filters?.search && {
        name: {
          contains: filters.search,
          mode: "insensitive",
        },
      }),
    },
    take: filters?.limit || 50,
    skip: filters?.offset || 0,
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects;
}

/**
 * Atualiza um projeto
 * 
 * @param workspaceId - ID do workspace
 * @param projectId - ID do projeto
 * @param payload - Dados para atualizar
 * @returns Projeto atualizado
 */
export async function updateProject(
  workspaceId: string,
  projectId: string,
  payload: UpdateProjectPayload
): Promise<Project> {
  if (!workspaceId?.trim() || !projectId?.trim()) {
    throw new Error("Workspace ID e Project ID são obrigatórios");
  }

  // TODO: Validar se projeto pertence ao workspace

  return prisma.project.update({
    where: { id: projectId },
    data: {
      ...(payload.name && { name: payload.name.trim() }),
      ...(payload.domain && { domain: payload.domain.trim() }),
    },
  });
}

/**
 * Deleta um projeto
 * 
 * @param workspaceId - ID do workspace
 * @param projectId - ID do projeto
 */
export async function deleteProject(
  workspaceId: string,
  projectId: string
): Promise<void> {
  if (!workspaceId?.trim() || !projectId?.trim()) {
    throw new Error("Workspace ID e Project ID são obrigatórios");
  }

  // TODO: Validar se projeto pertence ao workspace

  await prisma.project.delete({
    where: { id: projectId },
  });
}
