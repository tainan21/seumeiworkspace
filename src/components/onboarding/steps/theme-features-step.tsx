"use client";

import { ThemePicker, FeatureSelector } from "../primitives";
import { MOCK_FEATURES } from "~/lib/mock-data/features";
import { useOnboardingStore } from "~/lib/stores/onboarding-store";
import { Button } from "~/components/ui/button";

/**
 * Step 2: Tema & Features
 * 
 * Permite escolher:
 * - Tema visual (minimal, corporate, playful)
 * - Features a ativar (checkboxes)
 */
export function ThemeFeaturesStep() {
  const { formData, setFormData, goToNextStep, goToPreviousStep, canProceed } =
    useOnboardingStore();

  const handleThemeChange = (theme: "minimal" | "corporate" | "playful") => {
    setFormData({ theme });
  };

  const handleFeaturesChange = (features: string[]) => {
    setFormData({ selectedFeatures: features });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Escolha seu Tema</h2>
        <p className="text-muted-foreground">
          Selecione o estilo visual do seu workspace
        </p>
      </div>

      <ThemePicker
        selected={formData.theme}
        onChange={handleThemeChange}
      />

      <div>
        <h2 className="text-2xl font-bold mb-2">Selecione os Recursos</h2>
        <p className="text-muted-foreground mb-4">
          Escolha quais recursos você deseja ativar no seu workspace
        </p>
        <FeatureSelector
          features={MOCK_FEATURES}
          selected={formData.selectedFeatures || []}
          onChange={handleFeaturesChange}
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={goToPreviousStep}>
          Voltar
        </Button>
        <Button onClick={goToNextStep} disabled={!canProceed(2)}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
