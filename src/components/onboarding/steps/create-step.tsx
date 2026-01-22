"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useOnboardingStore } from "~/lib/stores/onboarding-store";
import { toast } from "~/hooks/use-toast";
import { createWorkspaceFromOnboarding } from "./actions";

/**
 * Step 8: Create & Redirect
 * 
 * Executa:
 * - Validações de domínio (enforceSingleFreeWorkspace)
 * - Criação do workspace
 * - Aplicação de RBAC
 * - Redirect para dashboard
 * - Confetti animation
 */
export function CreateStep() {
  const router = useRouter();
  const { formData, reset } = useOnboardingStore();
  const [isCreating, setIsCreating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);

    try {
      // Criar workspace usando server action
      const result = await createWorkspaceFromOnboarding(formData);

      if (result.success && result.workspaceSlug) {
        setIsSuccess(true);
        
        // Reset store após sucesso
        setTimeout(() => {
          reset();
          router.push(`/${result.workspaceSlug}`);
        }, 2000);
      } else {
        setError(result.error || "Erro ao criar workspace");
        toast({
          title: "Erro ao criar workspace",
          description: result.error || "Tente novamente",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("[CreateStep] Error:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao criar workspace"
      );
      toast({
        title: "Erro ao criar workspace",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Criar Workspace</h2>
        <p className="text-muted-foreground">
          Estamos quase lá! Clique no botão abaixo para criar seu workspace
        </p>
      </div>

      <AnimatePresence>
        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="h-16 w-16 text-primary mx-auto" />
            </motion.div>
            <h3 className="text-2xl font-bold">Workspace criado com sucesso!</h3>
            <p className="text-muted-foreground">
              Redirecionando para o dashboard...
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
                <p className="font-medium">Erro</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <Button
              onClick={handleCreate}
              disabled={isCreating}
              size="lg"
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando workspace...
                </>
              ) : (
                "Criar Workspace"
              )}
            </Button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
