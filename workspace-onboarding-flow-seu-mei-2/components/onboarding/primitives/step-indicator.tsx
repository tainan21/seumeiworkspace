"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { OnboardingStep } from "@/types/workspace"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"

interface StepIndicatorProps {
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]
  totalSteps?: number
}

const STEP_LABELS: Record<number, string> = {
  1: "Empresa",
  2: "Tema",
  3: "Tipo",
  4: "Escolha",
  5: "Montar",
  6: "Ajustar",
  7: "Revisar",
  8: "Criar",
}

export function StepIndicator({ currentStep, completedSteps, totalSteps = 8 }: StepIndicatorProps) {
  const reducedMotion = useReducedMotion()

  // Determinar steps visíveis (não mostrar 5 e 6 simultaneamente)
  const visibleSteps = [1, 2, 3, 4]
  if (currentStep >= 5 && currentStep <= 6) {
    visibleSteps.push(currentStep)
  } else if (currentStep >= 7) {
    visibleSteps.push(7, 8)
  }
  visibleSteps.push(7, 8)
  const uniqueSteps = [...new Set(visibleSteps)].sort((a, b) => a - b)

  return (
    <div className="flex items-center justify-center gap-1 px-4 py-3">
      {uniqueSteps.map((step, idx) => {
        const isCompleted = completedSteps.includes(step as OnboardingStep)
        const isCurrent = step === currentStep
        const isPast = step < currentStep

        return (
          <div key={step} className="flex items-center">
            <motion.div
              initial={reducedMotion ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "relative flex items-center justify-center",
                "w-8 h-8 rounded-full text-xs font-medium transition-all duration-300",
                isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2",
                isCompleted && !isCurrent && "bg-primary/20 text-primary",
                !isCurrent && !isCompleted && isPast && "bg-muted text-muted-foreground",
                !isCurrent && !isCompleted && !isPast && "bg-muted/50 text-muted-foreground/50",
              )}
            >
              {isCompleted && !isCurrent ? <Check className="w-4 h-4" /> : step}

              {isCurrent && (
                <motion.span
                  className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-muted-foreground whitespace-nowrap"
                  initial={reducedMotion ? false : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {STEP_LABELS[step]}
                </motion.span>
              )}
            </motion.div>

            {idx < uniqueSteps.length - 1 && (
              <div
                className={cn(
                  "w-6 h-0.5 mx-1 transition-colors duration-300",
                  isPast || isCompleted ? "bg-primary/30" : "bg-muted",
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
