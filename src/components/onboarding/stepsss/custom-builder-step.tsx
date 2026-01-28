"use client";

import { useState } from "react";
import { MenuBuilder } from "../primitivesss/menu-builder";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card } from "~/components/ui/card";
import { useOnboardingStore } from "~/lib/stores/onboarding-store";
import type { MenuComponent } from "~/domains/workspace/assemble-menu";
import { cn } from "~/lib/utils";

const COLOR_PRESETS = [
  { name: "Azul", primary: "#2563EB", accent: "#3B82F6" },
  { name: "Verde", primary: "#059669", accent: "#10B981" },
  { name: "Roxo", primary: "#7C3AED", accent: "#8B5CF6" },
  { name: "Rosa", primary: "#DB2777", accent: "#EC4899" },
  { name: "Laranja", primary: "#EA580C", accent: "#F97316" },
];

const TOPBAR_VARIANTS = [
  { id: "barTop-A", name: "Barra Superior A", description: "Layout compacto" },
  { id: "barTop-B", name: "Barra Superior B", description: "Layout médio" },
  { id: "barTop-C", name: "Barra Superior C", description: "Layout expandido" },
];

const SYSTEM_TYPES = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { id: "projects", label: "Projetos", icon: "FolderKanban" },
  { id: "docs", label: "Documentos", icon: "FileText" },
  { id: "people", label: "Pessoas", icon: "Users" },
  { id: "finances", label: "Financeiro", icon: "DollarSign" },
  { id: "clients", label: "Clientes", icon: "Building2" },
  { id: "calendar", label: "Agenda", icon: "Calendar" },
  { id: "analytics", label: "Analytics", icon: "BarChart3" },
  { id: "reports", label: "Relatórios", icon: "FileBarChart" },
  { id: "settings", label: "Configurações", icon: "Settings" },
];

/**
 * Step 5: Custom Builder
 * 
 * Permite:
 * - Escolher tipos de sistema (10 tipos)
 * - Selecionar paletas de cores
 * - Escolher variante de topbar (A/B/C)
 * - Organizar menu com DnD
 */
export function CustomBuilderStep() {
  const { formData, setFormData, goToNextStep, goToPreviousStep, canProceed } =
    useOnboardingStore();

  const [menuItems, setMenuItems] = useState<MenuComponent[]>(
    formData.menuComponents || []
  );

  const handleAddMenuItem = (systemType: string) => {
    const type = SYSTEM_TYPES.find((t) => t.id === systemType);
    if (!type) return;

    const newItem: MenuComponent = {
      id: type.id,
      type: "item",
      label: type.label,
      icon: type.icon,
    };

    setMenuItems([...menuItems, newItem]);
    setFormData({ menuComponents: [...menuItems, newItem] });
  };

  const handleReorderMenu = (items: MenuComponent[]) => {
    setMenuItems(items);
    setFormData({ menuComponents: items });
  };

  const handleRemoveMenuItem = (id: string) => {
    const newItems = menuItems.filter((item) => item.id !== id);
    setMenuItems(newItems);
    setFormData({ menuComponents: newItems });
  };

  const handleColorSelect = (preset: typeof COLOR_PRESETS[0]) => {
    setFormData({
      customColors: {
        primary: preset.primary,
        accent: preset.accent,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Monte seu Sistema</h2>
        <p className="text-muted-foreground">
          Escolha os componentes e organize seu menu
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna 1: Tipos de Sistema e Cores */}
        <div className="space-y-6">
          {/* Tipos de Sistema */}
          <div>
            <Label>Adicionar ao Menu</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {SYSTEM_TYPES.map((type) => {
                const isAdded = menuItems.some((item) => item.id === type.id);
                return (
                  <Button
                    key={type.id}
                    variant={isAdded ? "default" : "outline"}
                    size="sm"
                    onClick={() => !isAdded && handleAddMenuItem(type.id)}
                    disabled={isAdded}
                    type="button"
                  >
                    {type.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Paletas de Cores */}
          <div>
            <Label>Cores</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {COLOR_PRESETS.map((preset) => {
                const isSelected =
                  formData.customColors?.primary === preset.primary;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleColorSelect(preset)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                      isSelected
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    <div className="flex gap-1">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    <span className="text-xs">{preset.name}</span>
                  </button>
                );
              })}
            </div>
            {formData.customColors && (
              <div className="mt-2 space-y-2">
                <div>
                  <Label className="text-xs">Cor Primária</Label>
                  <Input
                    type="color"
                    value={formData.customColors.primary}
                    onChange={(e) =>
                      setFormData({
                        customColors: {
                          ...formData.customColors!,
                          primary: e.target.value,
                        },
                      })
                    }
                    className="h-10"
                  />
                </div>
                <div>
                  <Label className="text-xs">Cor de Destaque</Label>
                  <Input
                    type="color"
                    value={formData.customColors.accent}
                    onChange={(e) =>
                      setFormData({
                        customColors: {
                          ...formData.customColors!,
                          accent: e.target.value,
                        },
                      })
                    }
                    className="h-10"
                  />
                </div>
              </div>
            )}
          </div>

          {/* TopBar Variant */}
          <div>
            <Label htmlFor="topBarVariant">Barra Superior</Label>
            <Select
              value={formData.topBarVariant || ""}
              onValueChange={(value) =>
                setFormData({
                  topBarVariant: value as "barTop-A" | "barTop-B" | "barTop-C",
                })
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecione a variante" />
              </SelectTrigger>
              <SelectContent>
                {TOPBAR_VARIANTS.map((variant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.name} - {variant.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Coluna 2: Menu Builder */}
        <div>
          <MenuBuilder
            items={menuItems}
            onReorder={handleReorderMenu}
            onRemove={handleRemoveMenuItem}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={goToPreviousStep}>
          Voltar
        </Button>
        <Button onClick={goToNextStep} disabled={!canProceed(5)}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
