"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MenuBuilder } from "../primitives/menu-builder";
import { TemplateCard } from "../primitives/template-card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { MOCK_TEMPLATES } from "~/lib/mock-data/templates";
import { useOnboardingStore } from "~/lib/stores/onboarding-store";
import type { MenuComponent } from "~/domains/workspace/assemble-menu";

/**
 * Step 6: Template Customize
 * 
 * Permite:
 * - Escolher template
 * - Editar cores
 * - Reordenar menu
 * - Add/remove módulos
 */
export function TemplateCustomizeStep() {
  const { formData, setFormData, goToNextStep, goToPreviousStep, canProceed } =
    useOnboardingStore();

  const [menuItems, setMenuItems] = useState<MenuComponent[]>(
    formData.menuComponents || []
  );

  const selectedTemplate = MOCK_TEMPLATES.find(
    (t) => t.id === formData.templateId
  );

  const handleTemplateSelect = (templateId: string) => {
    setFormData({ templateId });
    // Carregar menu padrão do template (mock)
    const defaultMenu: MenuComponent[] = [
      { id: "dashboard", type: "item", label: "Dashboard", icon: "LayoutDashboard" },
      ...(selectedTemplate?.supportedFeatures || []).map((feature) => ({
        id: feature,
        type: "item" as const,
        label: feature,
        icon: "Circle",
      })),
    ];
    setMenuItems(defaultMenu);
    setFormData({ menuComponents: defaultMenu });
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Escolha e Customize seu Template</h2>
        <p className="text-muted-foreground">
          Selecione um template e faça ajustes rápidos
        </p>
      </div>

      {/* Seleção de Template */}
      {!formData.templateId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={formData.templateId === template.id}
              onSelect={() => handleTemplateSelect(template.id)}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Editor de Cores */}
          <div>
            <Label>Cores Personalizadas</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label className="text-xs">Cor Primária</Label>
                <Input
                  type="color"
                  value={
                    formData.templateCustomizations?.colors?.primary || "#2563EB"
                  }
                  onChange={(e) =>
                    setFormData({
                      templateCustomizations: {
                        ...formData.templateCustomizations,
                        colors: {
                          primary: e.target.value,
                          accent: formData.templateCustomizations?.colors?.accent || "#3B82F6",
                        },
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
                  value={
                    formData.templateCustomizations?.colors?.accent || "#3B82F6"
                  }
                  onChange={(e) =>
                    setFormData({
                      templateCustomizations: {
                        ...formData.templateCustomizations,
                        colors: {
                          primary: formData.templateCustomizations?.colors?.primary || "#2563EB",
                          accent: e.target.value,
                        },
                      },
                    })
                  }
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Menu Builder */}
          <div>
            <MenuBuilder
              items={menuItems}
              onReorder={handleReorderMenu}
              onRemove={handleRemoveMenuItem}
            />
          </div>

          {/* Botão para trocar template */}
          <Button
            variant="outline"
            onClick={() => {
              setFormData({ templateId: undefined });
              setMenuItems([]);
            }}
            type="button"
          >
            Trocar Template
          </Button>
        </motion.div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={goToPreviousStep}>
          Voltar
        </Button>
        <Button onClick={goToNextStep} disabled={!canProceed(6)}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
