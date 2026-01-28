// ============================================
// STORE: Onboarding State
// Zustand com persistência localStorage + syncToServer
// ============================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ThemeStyle,
  CompanyType,
  TopBarVariant,
  MenuComponent,
  BrandColors,
  IdentifierType,
} from "~/types/workspace-onboarding";
import { DEFAULT_MENU_COMPONENTS } from "~/lib/mock-data/components";

export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type BuildChoice = "template" | "custom" | null;

export interface OnboardingState {
  currentStep: OnboardingStep;
  // Step 1
  companyName: string;
  companyLogo: string | null;
  identifierType: IdentifierType;
  identifierValue: string;
  // Step 2
  theme: ThemeStyle;
  selectedFeatures: string[];
  // Step 3
  companyType: CompanyType | null;
  employeeCount: number;
  revenueRange: string;
  // Step 4
  buildChoice: BuildChoice;
  selectedTemplate: string | null;
  // Step 5/6
  menuComponents: MenuComponent[];
  topBarVariant: TopBarVariant;
  brandColors: BrandColors;
  // Step 7
  compatibilityWarnings: string[];
  userAcceptedWarnings: boolean;
  // Metadata
  completedSteps: OnboardingStep[];
  lastSavedAt: string | null;
}

const INITIAL_STATE: OnboardingState = {
  currentStep: 1,
  // Step 1
  companyName: "",
  companyLogo: null,
  identifierType: "CNPJ",
  identifierValue: "",
  // Step 2
  theme: "minimal",
  selectedFeatures: [],
  // Step 3
  companyType: null,
  employeeCount: 1,
  revenueRange: "",
  // Step 4
  buildChoice: null,
  selectedTemplate: null,
  // Step 5/6
  menuComponents: DEFAULT_MENU_COMPONENTS,
  topBarVariant: "barTop-A",
  brandColors: { primary: "#18181B", accent: "#3B82F6" },
  // Step 7
  compatibilityWarnings: [],
  userAcceptedWarnings: false,
  // Metadata
  completedSteps: [],
  lastSavedAt: null,
};

interface OnboardingActions {
  // Navigation
  setStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  markStepComplete: (step: OnboardingStep) => void;

  // Step 1: Intro
  setCompanyName: (name: string) => void;
  setCompanyLogo: (logo: string | null) => void;
  setIdentifierType: (type: IdentifierType) => void;
  setIdentifierValue: (value: string) => void;

  // Step 2: Theme & Features
  setTheme: (theme: ThemeStyle) => void;
  toggleFeature: (featureId: string) => void;
  setFeatures: (features: string[]) => void;

  // Step 3: Company Type
  setCompanyType: (type: CompanyType) => void;
  setEmployeeCount: (count: number) => void;
  setRevenueRange: (range: string) => void;

  // Step 4: Choice
  setBuildChoice: (choice: BuildChoice) => void;
  setSelectedTemplate: (templateId: string | null) => void;

  // Step 5/6: Customization
  setMenuComponents: (components: MenuComponent[]) => void;
  reorderMenuComponents: (fromIndex: number, toIndex: number) => void;
  setTopBarVariant: (variant: TopBarVariant) => void;
  setBrandColors: (colors: BrandColors) => void;

  // Step 7: Preview
  setCompatibilityWarnings: (warnings: string[]) => void;
  acceptWarnings: () => void;

  // Utilities
  reset: () => void;
  syncToServer: () => Promise<void>;
  canProceed: (step: OnboardingStep) => boolean;
}

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // Navigation
      setStep: (step) => set({ currentStep: step }),

      nextStep: () => {
        const { currentStep, buildChoice } = get();
        let next: OnboardingStep = currentStep;

        if (currentStep === 4) {
          // Após escolha, ir para step 5 (custom) ou 6 (template)
          next = buildChoice === "custom" ? 5 : 6;
        } else if (currentStep === 5 || currentStep === 6) {
          // Ambos vão para preview
          next = 7;
        } else if (currentStep < 8) {
          next = (currentStep + 1) as OnboardingStep;
        }

        set({ currentStep: next });
      },

      prevStep: () => {
        const { currentStep } = get();
        let prev: OnboardingStep = currentStep;

        if (currentStep === 5 || currentStep === 6) {
          prev = 4;
        } else if (currentStep > 1) {
          prev = (currentStep - 1) as OnboardingStep;
        }

        set({ currentStep: prev });
      },

      markStepComplete: (step) => {
        const { completedSteps } = get();
        if (!completedSteps.includes(step)) {
          set({ completedSteps: [...completedSteps, step] });
        }
      },

      // Step 1
      setCompanyName: (name) => set({ companyName: name }),
      setCompanyLogo: (logo) => set({ companyLogo: logo }),
      setIdentifierType: (type) => set({ identifierType: type }),
      setIdentifierValue: (value) => set({ identifierValue: value }),

      // Step 2
      setTheme: (theme) => set({ theme }),
      toggleFeature: (featureId) => {
        const { selectedFeatures } = get();
        const newFeatures = selectedFeatures.includes(featureId)
          ? selectedFeatures.filter((f) => f !== featureId)
          : [...selectedFeatures, featureId];
        set({ selectedFeatures: newFeatures });
      },
      setFeatures: (features) => set({ selectedFeatures: features }),

      // Step 3
      setCompanyType: (type) => set({ companyType: type }),
      setEmployeeCount: (count) => set({ employeeCount: count }),
      setRevenueRange: (range) => set({ revenueRange: range }),

      // Step 4
      setBuildChoice: (choice) => set({ buildChoice: choice }),
      setSelectedTemplate: (templateId) => set({ selectedTemplate: templateId }),

      // Step 5/6
      setMenuComponents: (components) => set({ menuComponents: components }),
      reorderMenuComponents: (fromIndex, toIndex) => {
        const { menuComponents } = get();
        const newComponents = [...menuComponents];
        const [removed] = newComponents.splice(fromIndex, 1);
        newComponents.splice(toIndex, 0, removed);
        set({ menuComponents: newComponents });
      },
      setTopBarVariant: (variant) => set({ topBarVariant: variant }),
      setBrandColors: (colors) => set({ brandColors: colors }),

      // Step 7
      setCompatibilityWarnings: (warnings) => set({ compatibilityWarnings: warnings }),
      acceptWarnings: () => set({ userAcceptedWarnings: true }),

      // Utilities
      reset: () => set(INITIAL_STATE),

      syncToServer: async () => {
        // Placeholder para sincronização futura com API real
        // Por enquanto, apenas marca o timestamp
        set({ lastSavedAt: new Date().toISOString() });
        // Quando API real estiver pronta:
        // await fetch('/api/domains/onboarding/sync', { ... })
      },

      canProceed: (step) => {
        const state = get();
        switch (step) {
          case 1:
            return state.companyName.trim().length > 0;
          case 2:
            return state.selectedFeatures.length > 0;
          case 3:
            return state.companyType !== null;
          case 4:
            return state.buildChoice !== null;
          case 5:
          case 6:
            return state.menuComponents.length > 0;
          case 7:
            return state.userAcceptedWarnings || state.compatibilityWarnings.length === 0;
          default:
            return true;
        }
      },
    }),
    {
      name: "seumei-onboarding",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persistir apenas dados do onboarding, não ações
        currentStep: state.currentStep,
        companyName: state.companyName,
        companyLogo: state.companyLogo,
        identifierType: state.identifierType,
        identifierValue: state.identifierValue,
        theme: state.theme,
        selectedFeatures: state.selectedFeatures,
        companyType: state.companyType,
        employeeCount: state.employeeCount,
        revenueRange: state.revenueRange,
        buildChoice: state.buildChoice,
        selectedTemplate: state.selectedTemplate,
        menuComponents: state.menuComponents,
        topBarVariant: state.topBarVariant,
        brandColors: state.brandColors,
        compatibilityWarnings: state.compatibilityWarnings,
        userAcceptedWarnings: state.userAcceptedWarnings,
        completedSteps: state.completedSteps,
        lastSavedAt: state.lastSavedAt,
      }),
    }
  )
);
