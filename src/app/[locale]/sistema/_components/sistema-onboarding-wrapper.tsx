"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { NewWorkspaceOnboarding } from "~/components/onboarding/new-workspace-onboarding";
import { useReducedMotion } from "~/lib/hooks/use-reduced-motion";

interface SistemaOnboardingWrapperProps {
  locale: string;
}

export function SistemaOnboardingWrapper({ locale }: SistemaOnboardingWrapperProps) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [isChecking, setIsChecking] = useState(true);
  const [hasWorkspace, setHasWorkspace] = useState(false);

  useEffect(() => {
    const workspace = localStorage.getItem("seumei-workspace");
    if (workspace) {
      try {
        const parsed = JSON.parse(workspace);
        // Validar formato básico
        if (parsed.workspaceId && parsed.slug && parsed.name) {
          setHasWorkspace(true);
          router.push(`/${locale}/sistema/dashboard`);
          return;
        }
      } catch (error) {
        // Formato inválido, limpar e mostrar onboarding
        localStorage.removeItem("seumei-workspace");
      }
    }
    setIsChecking(false);
  }, [router, locale]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Carregando Seumei...</p>
        </motion.div>
      </div>
    );
  }

  if (hasWorkspace) {
    return null; // Redirecionamento em andamento
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-8 px-4"
      >
        <NewWorkspaceOnboarding locale={locale} />
      </motion.div>
    </div>
  );
}
