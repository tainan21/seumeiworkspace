"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { StepIndicator } from "./primitives/step-indicator";
import { useReducedMotion } from "~/lib/hooks/use-reduced-motion";
import {
  IntroStep,
} from "./steps/intro-step";
import {
  ThemeFeaturesStep,
} from "./steps/theme-features-step";
import {
  CompanyTypeStep,
} from "./steps/company-type-step";
import {
  TemplateChoiceStep,
} from "./steps/template-choice-step";
import {
  CustomBuilderStep,
} from "./steps/custom-builder-step";
import {
  TemplateCustomizeStep,
} from "./steps/template-customize-step";
import {
  PreviewStep,
} from "./steps/preview-step";
import {
  CreateStep,
} from "./steps/create-step";
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

interface NewWorkspaceOnboardingProps {
  locale?: string;
}

/**
 * Onboarding para criação de novo workspace
 * Usa Zustand store para gerenciar estado
 */
export function NewWorkspaceOnboarding({ locale = "pt" }: NewWorkspaceOnboardingProps) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
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
        return <CreateStep locale={locale} />;
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
      <Card className="min-h-[500px] p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Tip/Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Precisa de ajuda? Entre em contato com o suporte.</p>
      </div>
    </div>
  );
}
