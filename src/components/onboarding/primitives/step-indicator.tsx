"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "~/lib/utils";
import { useReducedMotion } from "~/lib/hooks/use-reduced-motion";

interface Step {
  id: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
}

export function StepIndicator({ steps, currentStep, completedSteps }: StepIndicatorProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="flex items-center justify-center gap-1 px-4 py-3">
      {steps.map((step, idx) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = step.id === currentStep;
        const isPast = step.id < currentStep;

        return (
          <div key={step.id} className="flex items-center">
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
                !isCurrent && !isCompleted && !isPast && "bg-muted/50 text-muted-foreground/50"
              )}
            >
              {isCompleted && !isCurrent ? <Check className="w-4 h-4" /> : step.id}

              {isCurrent && (
                <motion.span
                  className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-muted-foreground whitespace-nowrap"
                  initial={reducedMotion ? false : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {step.label}
                </motion.span>
              )}
            </motion.div>

            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "w-6 h-0.5 mx-1 transition-colors duration-300",
                  isPast || isCompleted ? "bg-primary/30" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
