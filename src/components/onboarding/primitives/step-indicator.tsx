"use client";

import { Check } from "lucide-react";
import { cn } from "~/lib/utils";

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  current: number;
  completed: number[];
  onStepClick?: (step: number) => void;
}

/**
 * Indicador de progresso dos steps do onboarding
 */
export function StepIndicator({
  steps,
  current,
  completed,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completed.includes(step.id);
          const isCurrent = step.id === current;
          const isClickable = onStepClick && (isCompleted || isCurrent);

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isCurrent
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted bg-background text-muted-foreground",
                    isClickable && "cursor-pointer hover:border-primary/50",
                    !isClickable && "cursor-not-allowed"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </button>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-xs font-medium",
                      isCurrent ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 transition-colors",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
