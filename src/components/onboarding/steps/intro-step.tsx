"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Settings, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Uploader } from "../primitives/uploader";
import { useOnboardingStore } from "~/lib/stores/onboarding-store";
import { validateCompanyIdentifier } from "~/domains/company";
import { cn } from "~/lib/utils";

/**
 * Step 1: Intro + Dados Empresa
 * 
 * Mostra 3 cards explicativos e depois pede:
 * - Logo da empresa (upload)
 * - Nome da empresa (obrigatório)
 * - CNPJ/CPF (opcional)
 */
export function IntroStep() {
  const { formData, setFormData, goToNextStep, canProceed } = useOnboardingStore();
  const [showForm, setShowForm] = useState(false);
  const [identifierType, setIdentifierType] = useState<"CNPJ" | "CPF">("CNPJ");
  const [identifierError, setIdentifierError] = useState<string | null>(null);

  const handleIdentifierChange = (value: string) => {
    setIdentifierError(null);
    const validation = validateCompanyIdentifier(value, identifierType);
    
    if (validation.status === "invalid") {
      setIdentifierError(validation.errors.join(", "));
      setFormData({
        companyIdentifier: undefined,
      });
    } else if (validation.status === "valid") {
      setFormData({
        companyIdentifier: {
          type: identifierType,
          value: validation.formatted,
        },
      });
    } else {
      // Opcional - limpar
      setFormData({
        companyIdentifier: undefined,
      });
    }
  };

  const handleNext = () => {
    if (canProceed(1)) {
      goToNextStep();
    }
  };

  const introCards = [
    {
      icon: Building2,
      title: "Configure seu Workspace",
      description: "Vamos configurar seu espaço de trabalho personalizado",
    },
    {
      icon: Settings,
      title: "Monte seu Sistema",
      description: "Escolha os recursos e personalize conforme sua necessidade",
    },
    {
      icon: Sparkles,
      title: "Comece a Usar",
      description: "Tudo pronto para você começar a gerenciar seu negócio",
    },
  ];

  return (
    <div className="space-y-6">
      {!showForm ? (
        // Cards explicativos
        <div className="space-y-4">
          {introCards.map((card, index) => (
            <AnimatePresence key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <card.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle>{card.title}</CardTitle>
                        <CardDescription>{card.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            </AnimatePresence>
          ))}
          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowForm(true)}>
              Começar Configuração
            </Button>
          </div>
        </div>
      ) : (
        // Formulário de dados da empresa
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Sobre sua Empresa</h2>
            <p className="text-muted-foreground">
              Vamos começar com as informações básicas
            </p>
          </div>

          <div className="space-y-4">
            {/* Upload de Logo */}
            <div>
              <Label>Logo da Empresa (Opcional)</Label>
              <Uploader
                accept="image/*"
                maxSize={5}
                value={formData.companyLogo}
                onUpload={async (file) => {
                  // Mock: criar URL local
                  const url = URL.createObjectURL(file);
                  setFormData({ companyLogo: url });
                  return url;
                }}
                onRemove={() => {
                  if (formData.companyLogo?.startsWith("blob:")) {
                    URL.revokeObjectURL(formData.companyLogo);
                  }
                  setFormData({ companyLogo: undefined });
                }}
                className="mt-2"
              />
            </div>

            {/* Nome da Empresa */}
            <div>
              <Label htmlFor="companyName">
                Nome da Empresa <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyName"
                value={formData.companyName || ""}
                onChange={(e) =>
                  setFormData({ companyName: e.target.value })
                }
                placeholder="Ex: Minha Empresa LTDA"
                className="mt-2"
                required
              />
            </div>

            {/* CNPJ/CPF */}
            <div>
              <Label htmlFor="identifier">CNPJ/CPF (Opcional)</Label>
              <div className="flex gap-2 mt-2">
                <select
                  value={identifierType}
                  onChange={(e) =>
                    setIdentifierType(e.target.value as "CNPJ" | "CPF")
                  }
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="CNPJ">CNPJ</option>
                  <option value="CPF">CPF</option>
                </select>
                <Input
                  id="identifier"
                  value={
                    formData.companyIdentifier?.value?.replace(/\D/g, "") || ""
                  }
                  onChange={(e) => handleIdentifierChange(e.target.value)}
                  placeholder={
                    identifierType === "CNPJ"
                      ? "00.000.000/0000-00"
                      : "000.000.000-00"
                  }
                  className="flex-1"
                />
              </div>
              {identifierError && (
                <p className="text-sm text-destructive mt-1">
                  {identifierError}
                </p>
              )}
              {formData.companyIdentifier?.value && !identifierError && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.companyIdentifier.value}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Voltar
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed(1)}
            >
              Continuar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
