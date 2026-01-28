"use client";

import { Slider } from "~/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useOnboardingStore } from "~/lib/stores/onboarding-store";

const COMPANY_TYPES = [
  { value: "MEI", label: "MEI - Microempreendedor Individual" },
  { value: "Simples", label: "Simples Nacional" },
  { value: "EIRELI", label: "EIRELI" },
  { value: "Ltda", label: "LTDA" },
  { value: "SA", label: "S.A." },
  { value: "Startup", label: "Startup" },
];

const REVENUE_RANGES = [
  { value: "0-50k", label: "Até R$ 50.000" },
  { value: "50k-100k", label: "R$ 50.000 - R$ 100.000" },
  { value: "100k-500k", label: "R$ 100.000 - R$ 500.000" },
  { value: "500k-1m", label: "R$ 500.000 - R$ 1.000.000" },
  { value: "1m+", label: "Acima de R$ 1.000.000" },
];

/**
 * Step 3: Tipo & Tamanho Empresa
 * 
 * Permite escolher:
 * - Tipo de empresa (MEI, Simples, EIRELI, Ltda, SA, Startup)
 * - Número de funcionários (slider 1-500+)
 * - Faixa de faturamento (opcional)
 */
export function CompanyTypeStep() {
  const { formData, setFormData, goToNextStep, goToPreviousStep, canProceed } =
    useOnboardingStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Tipo e Tamanho da Empresa</h2>
        <p className="text-muted-foreground">
          Isso nos ajuda a configurar o sistema ideal para você
        </p>
      </div>

      <div className="space-y-6">
        {/* Tipo de Empresa */}
        <div>
          <Label htmlFor="companyType">
            Tipo de Empresa <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.companyType || ""}
            onValueChange={(value) =>
              setFormData({
                companyType: value as
                  | "MEI"
                  | "Simples"
                  | "EIRELI"
                  | "Ltda"
                  | "SA"
                  | "Startup",
              })
            }
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Número de Funcionários */}
        <div>
          <Label>
            Número de Funcionários
            {formData.employeeCount !== undefined && (
              <span className="ml-2 text-primary font-semibold">
                {formData.employeeCount}
              </span>
            )}
          </Label>
          <Slider
            value={[formData.employeeCount || 1]}
            onValueChange={([value]) =>
              setFormData({ employeeCount: value })
            }
            min={1}
            max={500}
            step={1}
            className="mt-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>1</span>
            <span>500+</span>
          </div>
        </div>

        {/* Faixa de Faturamento (Opcional) */}
        <div>
          <Label htmlFor="revenueRange">Faixa de Faturamento (Opcional)</Label>
          <Select
            value={formData.revenueRange || ""}
            onValueChange={(value) => setFormData({ revenueRange: value })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Selecione a faixa" />
            </SelectTrigger>
            <SelectContent>
              {REVENUE_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={goToPreviousStep}>
          Voltar
        </Button>
        <Button onClick={goToNextStep} disabled={!canProceed(3)}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
