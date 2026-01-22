"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as WorkspaceService from "~/domains/workspace/services/workspace.service";

/**
 * Query keys para workspace
 */
export const workspaceKeys = {
  all: ["workspaces"] as const,
  lists: () => [...workspaceKeys.all, "list"] as const,
  list: (filters?: string) => [...workspaceKeys.lists(), filters] as const,
  details: () => [...workspaceKeys.all, "detail"] as const,
  detail: (id: string) => [...workspaceKeys.details(), id] as const,
  bySlug: (slug: string) => [...workspaceKeys.all, "slug", slug] as const,
};

/**
 * Hook para buscar workspaces do usuário
 */
export function useWorkspaces(userId: string) {
  return useQuery({
    queryKey: workspaceKeys.lists(),
    queryFn: () => WorkspaceService.getWorkspacesByUserId(userId),
    enabled: !!userId,
  });
}

/**
 * Hook para buscar workspace por slug
 */
export function useWorkspaceBySlug(slug: string) {
  return useQuery({
    queryKey: workspaceKeys.bySlug(slug),
    queryFn: () => WorkspaceService.getWorkspaceBySlug(slug),
    enabled: !!slug,
  });
}

/**
 * Hook para buscar workspace por ID
 */
export function useWorkspaceById(id: string) {
  return useQuery({
    queryKey: workspaceKeys.detail(id),
    queryFn: () => WorkspaceService.getWorkspaceById(id),
    enabled: !!id,
  });
}

/**
 * Hook para mutation de criação de workspace
 */
export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WorkspaceService.CreateWorkspacePayload) =>
      WorkspaceService.createWorkspace(payload),
    onSuccess: () => {
      // Invalidar lista de workspaces
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
  });
}

/**
 * Hook para mutation de atualização de workspace
 */
export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof WorkspaceService.updateWorkspace>[1];
    }) => WorkspaceService.updateWorkspace(id, data),
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: workspaceKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
  });
}
