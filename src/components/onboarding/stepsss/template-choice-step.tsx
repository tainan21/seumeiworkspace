"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wrench } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useOnboardingStore } from "~/lib/stores/onboarding-store";
import { cn } from "~/lib/utils";

/**
 * Step 4: Template ou Custom
 * 
 * Permite escolher entre:
 * - Usar um template pronto
 * - Montar do zero (custom)
 * 
 * Inclui animação de assembly ao selecionar
 */
export function TemplateChoiceStep() {
  const { formData, setFormData, goToNextStep, goToPreviousStep, setCurrentStep } =
    useOnboardingStore();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelectTemplate = () => {
    setIsAnimating(true);
    setFormData({ useTemplate: true });
    
    // Aguardar animação antes de avançar
    setTimeout(() => {
      setIsAnimating(false);
      // Ir para step 6 (template customize)
      setCurrentStep(6);
    }, 2000);
  };

  const handleSelectCustom = () => {
    setIsAnimating(true);
    setFormData({ useTemplate: false });
    
    // Aguardar animação antes de avançar
    setTimeout(() => {
      setIsAnimating(false);
      // Ir para step 5 (custom builder)
      setCurrentStep(5);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Como você quer começar?</h2>
        <p className="text-muted-foreground">
          Escolha entre um template pronto ou monte seu sistema do zero
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Opção: Template */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            className={cn(
              "cursor-pointer transition-all h-full",
              formData.useTemplate === true && "ring-2 ring-primary"
            )}
            onClick={handleSelectTemplate}
          >
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 rounded-lg bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Template Pronto</CardTitle>
              </div>
              <CardDescription>
                Escolha um template pré-configurado e personalize depois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Configuração rápida</li>
                <li>✓ Otimizado por categoria</li>
                <li>✓ Personalizável</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Opção: Custom */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            className={cn(
              "cursor-pointer transition-all h-full",
              formData.useTemplate === false && "ring-2 ring-primary"
            )}
            onClick={handleSelectCustom}
          >
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 rounded-lg bg-primary/10">
                  <Wrench className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Montar do Zero</CardTitle>
              </div>
              <CardDescription>
                Construa seu sistema exatamente como você precisa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Controle total</li>
                <li>✓ Escolha cada componente</li>
                <li>✓ Layout personalizado</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Animação de Assembly */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="text-center space-y-4">
              <div className="flex gap-2 justify-center">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="w-4 h-4 rounded-full bg-primary"
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: i * 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                    }}
                  />
                ))}
              </div>
              <p className="text-lg font-semibold">Montando seu sistema...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={goToPreviousStep} disabled={isAnimating}>
          Voltar
        </Button>
        <div className="text-sm text-muted-foreground flex items-center">
          {formData.useTemplate === true && "Template selecionado"}
          {formData.useTemplate === false && "Custom selecionado"}
        </div>
      </div>
    </div>
  );
}
