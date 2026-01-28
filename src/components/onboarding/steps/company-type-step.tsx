"use client"

import { motion } from "framer-motion"
import { ArrowRight, ArrowLeft, Users, TrendingUp } from "lucide-react"
import { cn } from "~/lib/utils"
import { useOnboardingStore } from "~/lib/stores/onboarding-store"
import { useReducedMotion } from "~/lib/hooks/use-reduced-motion"
import { MOCK_COMPANY_TYPES, MOCK_REVENUE_RANGES } from "~/lib/mock-data/company-types"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label" 
import { Slider } from "~/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import type { CompanyType } from "~/types/workspace-onboarding"

export function CompanyTypeStep() {
  const reducedMotion = useReducedMotion()
  const {
    companyType,
    setCompanyType,
    employeeCount,
    setEmployeeCount,
    revenueRange,
    setRevenueRange,
    canProceed,
    nextStep,
    prevStep,
    markStepComplete,
  } = useOnboardingStore()

  const handleContinue = () => {
    if (canProceed(3)) {
      markStepComplete(3)
      nextStep()
    }
  }

  const formatEmployeeCount = (count: number): string => {
    if (count >= 500) return "500+"
    return count.toString()
  }

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-lg mx-auto p-6 space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Tipo de Empresa</h2>
        <p className="text-muted-foreground">Essas informações nos ajudam a sugerir o melhor template</p>
      </div>

      {/* Company Type */}
      <div className="space-y-3">
        <Label>Tipo de empresa</Label>
        <div className="grid grid-cols-2 gap-3">
          {MOCK_COMPANY_TYPES.map((type, idx) => (
            <motion.button
              key={type.value}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setCompanyType(type.value as CompanyType)}
              className={cn(
                "text-left p-4 rounded-xl border-2 transition-all duration-200",
                companyType === type.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30",
              )}
            >
              <span className="font-medium text-foreground">{type.label}</span>
              <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Employee Count */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Número de funcionários
          </Label>
          <span className="text-sm font-medium text-primary">{formatEmployeeCount(employeeCount)}</span>
        </div>
        <Slider
          value={[employeeCount]}
          onValueChange={([v]) => setEmployeeCount(v)}
          min={1}
          max={500}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1</span>
          <span>10</span>
          <span>50</span>
          <span>100</span>
          <span>500+</span>
        </div>
      </div>

      {/* Revenue Range */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Faixa de faturamento anual
        </Label>
        <Select value={revenueRange} onValueChange={setRevenueRange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione (opcional)" />
          </SelectTrigger>
          <SelectContent>
            {MOCK_REVENUE_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="flex-1 bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={handleContinue} disabled={!canProceed(3)} className="flex-1">
          Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  )
}
