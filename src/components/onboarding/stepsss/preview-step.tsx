"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Code } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useOnboardingStore } from "~/lib/stores/onboarding-store";
import { assembleMenu } from "~/domains/workspace/assemble-menu";
import { cn } from "~/lib/utils";

/**
 * Step 7: Preview & Confirmação
 * 
 * Exibe:
 * - JSON completo com todas as seleções
 * - Preview visual do workspace
 * - Botão de confirmação
 */
export function PreviewStep() {
  const { formData, goToNextStep, goToPreviousStep } = useOnboardingStore();
  const [showJson, setShowJson] = useState(false);

  // Montar menu usando assembleMenu
  const menuItems = formData.menuComponents
    ? assembleMenu(
        formData.menuComponents,
        formData.selectedFeatures || []
      )
    : [];

  // Gerar JSON completo
  const workspacePayload = {
    name: formData.companyName || "Meu Workspace",
    company: {
      name: formData.companyName,
      identifier: formData.companyIdentifier,
    },
    brand: {
      logo: formData.companyLogo,
      colors: formData.useTemplate
        ? formData.templateCustomizations?.colors
        : formData.customColors,
    },
    theme: formData.theme || "minimal",
    companyType: formData.companyType,
    employeeCount: formData.employeeCount,
    template: formData.useTemplate ? formData.templateId : undefined,
    selectedFeatures: formData.selectedFeatures || [],
    menuItems,
    topBarVariant: formData.topBarVariant || "barTop-A",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Revise e Confirme</h2>
        <p className="text-muted-foreground">
          Verifique todas as configurações antes de criar seu workspace
        </p>
      </div>

      <Tabs defaultValue="preview" className="w-full">
        <TabsList>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="json">
            <Code className="h-4 w-4 mr-2" />
            JSON
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          {/* Preview Visual */}
          <Card>
            <CardHeader>
              <CardTitle>Preview do Workspace</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock TopBar */}
                <div
                  className="h-16 rounded-lg border flex items-center px-4"
                  style={{
                    backgroundColor:
                      workspacePayload.brand?.colors?.primary || "#2563EB",
                    color: "white",
                  }}
                >
                  <div className="font-semibold">
                    {workspacePayload.name}
                  </div>
                </div>

                {/* Mock Sidebar + Content */}
                <div className="flex gap-4">
                  <div className="w-64 rounded-lg border bg-muted/40 p-4">
                    <h3 className="font-semibold mb-4">Menu</h3>
                    <nav className="space-y-2">
                      {menuItems.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="p-2 rounded hover:bg-accent text-sm"
                        >
                          {item.label}
                        </div>
                      ))}
                      {menuItems.length > 5 && (
                        <div className="text-xs text-muted-foreground">
                          +{menuItems.length - 5} mais
                        </div>
                      )}
                    </nav>
                  </div>
                  <div className="flex-1 rounded-lg border bg-card p-6">
                    <h3 className="font-semibold mb-2">Conteúdo Principal</h3>
                    <p className="text-sm text-muted-foreground">
                      Seu workspace será criado com estas configurações
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome:</span>
                <span className="font-medium">{workspacePayload.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tema:</span>
                <span className="font-medium">{workspacePayload.theme}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recursos:</span>
                <span className="font-medium">
                  {workspacePayload.selectedFeatures.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Itens no Menu:</span>
                <span className="font-medium">{menuItems.length}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json">
          <Card>
            <CardHeader>
              <CardTitle>Configuração Completa (JSON)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(workspacePayload, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={goToPreviousStep}>
          Voltar
        </Button>
        <Button onClick={goToNextStep} size="lg">
          Confirmar e Criar Workspace
        </Button>
      </div>
    </div>
  );
}
