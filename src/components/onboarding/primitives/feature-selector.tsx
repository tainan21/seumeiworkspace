"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/utils";

export interface Feature {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category?: string;
}

interface FeatureSelectorProps {
  features: Feature[];
  selected: string[];
  onChange: (selected: string[]) => void;
  max?: number;
  className?: string;
}

/**
 * Seletor de features com checkboxes
 * Suporta seleção múltipla e limite máximo
 */
export function FeatureSelector({
  features,
  selected,
  onChange,
  max,
  className,
}: FeatureSelectorProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleFeature = (featureId: string) => {
    if (selected.includes(featureId)) {
      onChange(selected.filter((id) => id !== featureId));
    } else {
      if (max && selected.length >= max) {
        return; // Limite atingido
      }
      onChange([...selected, featureId]);
    }
  };

  const toggleAll = () => {
    if (selected.length === features.length) {
      onChange([]);
    } else {
      const allIds = features.map((f) => f.id);
      if (max) {
        onChange(allIds.slice(0, max));
      } else {
        onChange(allIds);
      }
    }
  };

  const isSelected = (featureId: string) => selected.includes(featureId);
  const canSelectMore = !max || selected.length < max;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header com contador */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Recursos</h3>
          <p className="text-sm text-muted-foreground">
            {selected.length} de {features.length} selecionados
            {max && ` (máximo ${max})`}
          </p>
        </div>
        <button
          type="button"
          onClick={toggleAll}
          className="text-sm text-primary hover:underline"
        >
          {selected.length === features.length ? "Desmarcar todos" : "Selecionar todos"}
        </button>
      </div>

      {/* Lista de features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {features.map((feature) => {
          const selected = isSelected(feature.id);
          const disabled = !selected && !canSelectMore;

          return (
            <Card
              key={feature.id}
              className={cn(
                "p-4 cursor-pointer transition-all",
                selected && "ring-2 ring-primary",
                disabled && "opacity-50 cursor-not-allowed",
                !disabled && "hover:shadow-md"
              )}
              onClick={() => !disabled && toggleFeature(feature.id)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selected}
                  onCheckedChange={() => !disabled && toggleFeature(feature.id)}
                  disabled={disabled}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <h4 className="font-medium">{feature.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
                {selected && (
                  <Check className="h-5 w-5 text-primary shrink-0" />
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
