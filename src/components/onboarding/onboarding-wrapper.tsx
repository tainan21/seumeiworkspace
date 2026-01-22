"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { OnboardingRouter, type OnboardingType } from "./onboarding-router";
import type { Workspace } from "@prisma/client";

interface OnboardingContextValue {
  type: OnboardingType;
  workspaceId?: string;
  workspace?: Workspace;
  progress?: {
    currentStep: number;
    completedSteps: number[];
    isCompleted: boolean;
  };
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

/**
 * Hook para acessar contexto do onboarding
 */
export function useOnboardingContext(): OnboardingContextValue {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error(
      "useOnboardingContext must be used within OnboardingWrapper"
    );
  }

  return context;
}

interface OnboardingWrapperProps {
  type: OnboardingType;
  workspaceId?: string;
  workspace?: Workspace;
  progress?: {
    currentStep: number;
    completedSteps: number[];
    isCompleted: boolean;
  };
  children?: ReactNode;
}

/**
 * Wrapper unificado que gerencia ambos os fluxos de onboarding
 * 
 * - Detecta contexto (novo workspace vs existente)
 * - Fornece Context API para compartilhar estado entre steps
 * - Integra com OnboardingCompletion do Prisma para workspace existente
 * - Fallback para Zustand store para criação de workspace
 */
export function OnboardingWrapper({
  type,
  workspaceId,
  workspace,
  progress,
  children,
}: OnboardingWrapperProps) {
  const contextValue: OnboardingContextValue = {
    type,
    workspaceId,
    workspace,
    progress,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children || (
        <OnboardingRouter
          type={type}
          workspace={workspace}
          progress={progress}
        />
      )}
    </OnboardingContext.Provider>
  );
}
