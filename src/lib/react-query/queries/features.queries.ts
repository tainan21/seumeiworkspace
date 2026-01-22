"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as FeaturesService from "~/domains/features";

/**
 * Query keys para features
 */
export const featureKeys = {
  all: ["features"] as const,
  available: () => [...featureKeys.all, "available"] as const,
  active: (workspaceId: string) =>
    [...featureKeys.all, "active", workspaceId] as const,
  enabled: (workspaceId: string, featureCode: string) =>
    [...featureKeys.all, "enabled", workspaceId, featureCode] as const,
};

/**
 * Hook para buscar features disponíveis
 */
export function useAvailableFeatures(category?: string) {
  return useQuery({
    queryKey: [...featureKeys.available(), category],
    queryFn: () => FeaturesService.getAvailableFeatures(category as any),
  });
}

/**
 * Hook para buscar features ativas do workspace
 */
export function useActiveFeatures(workspaceId: string) {
  return useQuery({
    queryKey: featureKeys.active(workspaceId),
    queryFn: () => FeaturesService.getActiveFeatures(workspaceId),
    enabled: !!workspaceId,
  });
}

/**
 * Hook para verificar se feature está ativa
 */
export function useFeatureEnabled(workspaceId: string, featureCode: string) {
  return useQuery({
    queryKey: featureKeys.enabled(workspaceId, featureCode),
    queryFn: () => FeaturesService.isFeatureEnabled(workspaceId, featureCode),
    enabled: !!workspaceId && !!featureCode,
  });
}

/**
 * Hook para mutation de ativação de feature
 */
export function useActivateFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      featureCode,
    }: {
      workspaceId: string;
      featureCode: string;
    }) => FeaturesService.activateFeature(workspaceId, featureCode),
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: featureKeys.active(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: featureKeys.enabled(variables.workspaceId, variables.featureCode),
      });
    },
  });
}

/**
 * Hook para mutation de compra de feature com coins
 */
export function usePurchaseFeatureWithCoins() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      featureCode,
      price,
    }: {
      workspaceId: string;
      featureCode: string;
      price: number;
    }) =>
      FeaturesService.purchaseFeatureWithCoins(
        workspaceId,
        featureCode,
        price
      ),
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: featureKeys.active(variables.workspaceId),
      });
    },
  });
}
