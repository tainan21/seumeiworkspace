"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Dados do formulário de onboarding
 */
export interface OnboardingFormData {
  // Step 1: Intro + Dados Empresa
  companyName?: string;
  companyLogo?: string;
  companyIdentifier?: {
    type: "CNPJ" | "CPF";
    value: string;
  };

  // Step 2: Tema & Features
  theme?: "minimal" | "corporate" | "playful";
  selectedFeatures?: string[];

  // Step 3: Tipo & Tamanho
  companyType?: "MEI" | "Simples" | "EIRELI" | "Ltda" | "SA" | "Startup";
  employeeCount?: number;
  revenueRange?: string;

  // Step 4: Template ou Custom
  useTemplate?: boolean;
  templateId?: string;

  // Step 5: Custom Builder (se não usar template)
  customColors?: {
    primary: string;
    accent: string;
  };
  topBarVariant?: "barTop-A" | "barTop-B" | "barTop-C";
  menuComponents?: import("~/domains/workspace/assemble-menu").MenuComponent[];

  // Step 6: Template Customize (se usar template)
  templateCustomizations?: {
    colors?: {
      primary: string;
      accent: string;
    };
    menuOrder?: string[];
    enabledModules?: string[];
  };
}

/**
 * Estado do store de onboarding
 */
interface OnboardingStore {
  // Estado do fluxo
  currentStep: number;
  completedSteps: number[];
  isCompleted: boolean;

  // Dados do formulário
  formData: OnboardingFormData;

  // Ações
  setCurrentStep: (step: number) => void;
  setFormData: (data: Partial<OnboardingFormData>) => void;
  completeStep: (step: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  reset: () => void;
  canProceed: (step: number) => boolean;
}

const MAX_STEPS = 8;

const defaultFormData: OnboardingFormData = {
  selectedFeatures: [],
  menuComponents: [],
};

/**
 * Store Zustand para gerenciar estado do onboarding
 * Persiste dados no localStorage
 */
export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      completedSteps: [],
      isCompleted: false,
      formData: defaultFormData,

      setCurrentStep: (step: number) => {
        if (step < 1 || step > MAX_STEPS) return;
        set({ currentStep: step });
      },

      setFormData: (data: Partial<OnboardingFormData>) => {
        set((state) => ({
          formData: { ...state.formData, ...data },
        }));
      },

      completeStep: (step: number) => {
        set((state) => {
          const newCompletedSteps = [...state.completedSteps];
          if (!newCompletedSteps.includes(step)) {
            newCompletedSteps.push(step);
          }
          return {
            completedSteps: newCompletedSteps,
            isCompleted: newCompletedSteps.length === MAX_STEPS,
          };
        });
      },

      goToNextStep: () => {
        const { currentStep, completedSteps } = get();
        if (currentStep < MAX_STEPS) {
          const newStep = currentStep + 1;
          set({ currentStep: newStep });
          get().completeStep(currentStep);
        }
      },

      goToPreviousStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },

      reset: () => {
        set({
          currentStep: 1,
          completedSteps: [],
          isCompleted: false,
          formData: defaultFormData,
        });
      },

      canProceed: (step: number): boolean => {
        const { formData } = get();

        switch (step) {
          case 1:
            // Step 1: Nome da empresa obrigatório
            return !!formData.companyName?.trim();

          case 2:
            // Step 2: Pelo menos 1 feature selecionada
            return (
              Array.isArray(formData.selectedFeatures) &&
              formData.selectedFeatures.length > 0
            );

          case 3:
            // Step 3: Tipo de empresa obrigatório
            return !!formData.companyType;

          case 4:
            // Step 4: Escolha entre template ou custom
            return formData.useTemplate !== undefined;

          case 5:
            // Step 5: Custom builder - menu e topbar configurados
            if (formData.useTemplate === false) {
              return (
                !!formData.topBarVariant &&
                Array.isArray(formData.menuComponents) &&
                formData.menuComponents.length > 0
              );
            }
            return true;

          case 6:
            // Step 6: Template customize - customizações aplicadas
            if (formData.useTemplate === true) {
              return !!formData.templateId;
            }
            return true;

          case 7:
            // Step 7: Preview - sempre pode prosseguir
            return true;

          case 8:
            // Step 8: Create - sempre pode prosseguir
            return true;

          default:
            return false;
        }
      },
    }),
    {
      name: "onboarding-store",
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        isCompleted: state.isCompleted,
        formData: state.formData,
      }),
    }
  )
);
