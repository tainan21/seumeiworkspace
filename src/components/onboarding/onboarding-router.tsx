"use client";

import { useMemo } from "react";
import { OnboardingWizard } from "~/components/features/onboarding/onboarding-wizard";
import { NewWorkspaceOnboarding } from "./new-workspace-onboarding";
import type { Workspace } from "@prisma/client";

export type OnboardingType = "new-workspace" | "existing-workspace";

interface OnboardingRouterProps {
  type: OnboardingType;
  workspace?: Workspace;
  progress?: {
    currentStep: number;
    completedSteps: number[];
    isCompleted: boolean;
  };
}

/**
 * Router inteligente que decide qual fluxo de onboarding usar
 * 
 * - "new-workspace": Usa o onboarding novo (8 steps) com Zustand store
 * - "existing-workspace": Usa o onboarding antigo (5 steps) com OnboardingCompletion
 */
export function OnboardingRouter({
  type,
  workspace,
  progress,
}: OnboardingRouterProps) {
  const renderOnboarding = useMemo(() => {
    if (type === "new-workspace") {
      // Onboarding para criação de novo workspace
      return <NewWorkspaceOnboarding />;
    }

    if (type === "existing-workspace" && workspace && progress) {
      // Onboarding para workspace existente
      return (
        <OnboardingWizard
          workspace={workspace}
          progress={progress}
        />
      );
    }

    return null;
  }, [type, workspace, progress]);

  return <>{renderOnboarding}</>;
}
