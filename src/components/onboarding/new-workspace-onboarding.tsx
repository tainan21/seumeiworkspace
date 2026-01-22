"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { StepIndicator } from "./primitives/step-indicator";
import {
  IntroStep,
  ThemeFeaturesStep,
  CompanyTypeStep,
  TemplateChoiceStep,
  CustomBuilderStep,
  TemplateCustomizeStep,
  PreviewStep,
  CreateStep,
} from "./steps";
import { useOnboardingStore } from "~/lib/stores/onboarding-store";

const STEPS = [
  { id: 1, title: "Intro", description: "Dados da empresa" },
  { id: 2, title: "Tema & Features", description: "Personalização" },
  { id: 3, title: "Tipo Empresa", description: "Categoria" },
  { id: 4, title: "Template", description: "Escolha" },
  { id: 5, title: "Custom", description: "Builder" },
  { id: 6, title: "Customize", description: "Template" },
  { id: 7, title: "Preview", description: "Revisão" },
  { id: 8, title: "Criar", description: "Finalizar" },
];

/**
 * Onboarding para criação de novo workspace
 * Usa Zustand store para gerenciar estado
 */
export function NewWorkspaceOnboarding() {
  const router = useRouter();
  const {
    currentStep,
    completedSteps,
    goToNextStep,
    goToPreviousStep,
    setCurrentStep,
  } = useOnboardingStore();

  const progressPercentage = ((currentStep - 1) / STEPS.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <IntroStep />;
      case 2:
        return <ThemeFeaturesStep />;
      case 3:
        return <CompanyTypeStep />;
      case 4:
        return <TemplateChoiceStep />;
      case 5:
        return <CustomBuilderStep />;
      case 6:
        return <TemplateCustomizeStep />;
      case 7:
        return <PreviewStep />;
      case 8:
        return <CreateStep />;
      default:
        return <div>Passo desconhecido</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Crie seu Workspace</h1>
        <p className="text-muted-foreground">
          Configure seu espaço de trabalho em poucos passos
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span>Passo {currentStep} de {STEPS.length}</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2 mb-4" />

        {/* Step Indicator */}
        <StepIndicator
          steps={STEPS}
          current={currentStep}
          completed={completedSteps}
          onStepClick={(step) => {
            // Permitir voltar para steps já completados
            if (completedSteps.includes(step) || step < currentStep) {
              setCurrentStep(step);
            }
          }}
        />
      </div>

      {/* Main Content */}
      <Card className="min-h-[500px] p-6">
        {renderStep()}
      </Card>

      {/* Tip/Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Precisa de ajuda? Entre em contato com o suporte.</p>
      </div>
    </div>
  );
}
