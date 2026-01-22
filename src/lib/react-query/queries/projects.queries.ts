"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ProjectService from "~/domains/projects/services/project.service";

/**
 * Query keys para projetos
 */
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (workspaceId: string, filters?: string) =>
    [...projectKeys.lists(), workspaceId, filters] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (workspaceId: string, id: string) =>
    [...projectKeys.details(), workspaceId, id] as const,
};

/**
 * Hook para buscar projetos do workspace
 */
export function useProjects(workspaceId: string, filters?: ProjectService.ProjectFilters) {
  return useQuery({
    queryKey: projectKeys.list(workspaceId, JSON.stringify(filters)),
    queryFn: () => ProjectService.getProjects(workspaceId, filters),
    enabled: !!workspaceId,
  });
}

/**
 * Hook para buscar projeto por ID
 */
export function useProject(workspaceId: string, projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(workspaceId, projectId),
    queryFn: () => ProjectService.getProjectById(workspaceId, projectId),
    enabled: !!workspaceId && !!projectId,
  });
}

/**
 * Hook para mutation de criação de projeto
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProjectService.CreateProjectPayload) =>
      ProjectService.createProject(payload),
    onSuccess: (_, variables) => {
      // Invalidar lista de projetos do workspace
      queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      });
    },
  });
}

/**
 * Hook para mutation de atualização de projeto
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      projectId,
      data,
    }: {
      workspaceId: string;
      projectId: string;
      data: ProjectService.UpdateProjectPayload;
    }) => ProjectService.updateProject(workspaceId, projectId, data),
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.workspaceId, variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      });
    },
  });
}

/**
 * Hook para mutation de deleção de projeto
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      projectId,
    }: {
      workspaceId: string;
      projectId: string;
    }) => ProjectService.deleteProject(workspaceId, projectId),
    onSuccess: (_, variables) => {
      // Remover do cache e invalidar lista
      queryClient.removeQueries({
        queryKey: projectKeys.detail(variables.workspaceId, variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      });
    },
  });
}
