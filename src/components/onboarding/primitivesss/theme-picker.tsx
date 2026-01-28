"use client";

import { Check } from "lucide-react";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";

export type ThemeType = "minimal" | "corporate" | "playful";

interface Theme {
  id: ThemeType;
  name: string;
  description: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
  };
}

const THEMES: Theme[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Design limpo e simples",
    colors: {
      primary: "#6366F1",
      accent: "#22D3EE",
      background: "#FFFFFF",
    },
  },
  {
    id: "corporate",
    name: "Corporativo",
    description: "Profissional e elegante",
    colors: {
      primary: "#1E40AF",
      accent: "#059669",
      background: "#F9FAFB",
    },
  },
  {
    id: "playful",
    name: "Descontraído",
    description: "Colorido e criativo",
    colors: {
      primary: "#EC4899",
      accent: "#F59E0B",
      background: "#FEF3C7",
    },
  },
];

interface ThemePickerProps {
  selected?: ThemeType;
  onChange: (theme: ThemeType) => void;
  className?: string;
}

/**
 * Seletor de tema visual
 * Exibe preview das cores de cada tema
 */
export function ThemePicker({
  selected,
  onChange,
  className,
}: ThemePickerProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      {THEMES.map((theme) => {
        const isSelected = selected === theme.id;

        return (
          <Card
            key={theme.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isSelected && "ring-2 ring-primary"
            )}
            onClick={() => onChange(theme.id)}
          >
            <div className="p-4 space-y-3">
              {/* Preview de cores */}
              <div className="flex gap-2">
                <div
                  className="h-12 flex-1 rounded"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div
                  className="h-12 flex-1 rounded"
                  style={{ backgroundColor: theme.colors.accent }}
                />
              </div>

              {/* Informações */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{theme.name}</h3>
                  {isSelected && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {theme.description}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
