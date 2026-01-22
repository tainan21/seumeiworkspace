"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, XCircle, Loader2, ArrowRight, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useOnboardingStore } from "@/lib/stores/onboarding-store"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"
import { useApiCall } from "@/lib/hooks/use-api-call"
import { createWorkspaceApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import type { CreateWorkspaceInput } from "@/types/workspace"

type CreatePhase = "creating" | "success" | "error"

export function CreateStep() {

  const router = useRouter()
  const reducedMotion = useReducedMotion()
  const [phase, setPhase] = useState<CreatePhase>("creating")
  const [confetti, setConfetti] = useState(false)

  const {
    companyName,
    companyLogo,
    identifierType,
    identifierValue,
    theme,
    selectedFeatures,
    companyType,
    employeeCount,
    selectedTemplate,
    menuComponents,
    topBarVariant,
    brandColors,
    markStepComplete,
    reset,
  } = useOnboardingStore()

  const [createApi, executeCreate] = useApiCall(createWorkspaceApi)

  // Build input once per invocation
  const buildInput = useCallback((): CreateWorkspaceInput | null => {
    if (!companyType) return null

    return {
      userId: "user_mock_1",
      name: companyName,
      brand: {
        logo: companyLogo || undefined,
        colors: brandColors,
      },
      company: {
        name: companyName,
        identifier: identifierValue ? { type: identifierType, value: identifierValue } : undefined,
      },
      theme,
      companyType,
      employeeCount,
      template: selectedTemplate || undefined,
      selectedFeatures,
      menuComponents,
      topBarVariant,
    }
  }, [
    companyName,
    companyLogo,
    brandColors,
    identifierType,
    identifierValue,
    theme,
    companyType,
    employeeCount,
    selectedTemplate,
    selectedFeatures,
    menuComponents,
    topBarVariant,
  ])

  const handleCreate = useCallback(async () => {
    const input = buildInput()
    if (!input) {
      setPhase("error")
      return
    }

    setPhase("creating")

    try {
      const result = await executeCreate(input)

      if (result?.success) {
        // store workspace locally for dashboard use
        try {
          typeof window !== "undefined" && localStorage.setItem("seumei-workspace", JSON.stringify(result.workspace))
        } catch (e) {
          // ignore localStorage failures (private mode, etc.)
        }

        markStepComplete?.(8)
        setPhase("success")
        setConfetti(true)

        // minimal confetti life
        if (!reducedMotion) {
          setTimeout(() => setConfetti(false), 2000)
        }
      } else {
        setPhase("error")
      }
    } catch (_err) {
      // make sure we set error state so UI can show retry/reset
      setPhase("error")
    }
  }, [buildInput, executeCreate, markStepComplete, reducedMotion])

  // Run once on mount (or when the buildInput signature changes)
  useEffect(() => {
    handleCreate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleCreate])

  const handleGoToDashboard = useCallback(() => {
    // Cleanup onboarding state and go to dashboard
    reset?.()
    router.push("/dashboard")
  }, [reset, router])

  const handleRetry = useCallback(() => {
    // keep existing inputs and simply try the creation again
    // if the hook supports a reset API, call it
    createApi.reset?.()
    handleCreate()
  }, [createApi, handleCreate])

  const handleResetFlow = useCallback(() => {
    // full UI + store reset, stays on same route
    createApi.reset?.()
    reset?.()
    setPhase("creating")
    // small tick to allow UI to reset before re-run
    setTimeout(() => setPhase("creating"), 0)
  }, [createApi, reset])

  const isLoading = phase === "creating" || createApi.loading

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto p-6 text-center"
    >
      {/* Confetti Canvas */}
      {confetti && !reducedMotion && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <ConfettiEffect reducedMotion={reducedMotion} />
        </div>
      )}

      {phase === "creating" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Criando seu workspace...</h2>
            <p className="text-muted-foreground">Estamos configurando tudo para você</p>
          </div>

          {/* Progress steps */}
          <div className="space-y-3 text-left max-w-xs mx-auto">
            {[
              "Validando dados",
              "Criando estrutura",
              "Aplicando tema",
              "Configurando permissões",
            ].map((step, idx) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.18 }}
                className="flex items-center gap-3 text-sm"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.18 + 0.08 }}
                  className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                </motion.div>
                <span className="text-muted-foreground">{step}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {phase === "success" && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center"
          >
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </motion.div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Workspace criado!</h2>
            <p className="text-muted-foreground">Seu sistema está pronto para uso</p>
          </div>

          <Button onClick={handleGoToDashboard} size="lg" className="w-full">
            Ir para o Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}

      {phase === "error" && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-destructive" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Erro ao criar workspace</h2>
            <p className="text-muted-foreground mb-4">{createApi.error || "Algo deu errado. Tente novamente."}</p>

            {createApi.data && !createApi.data.success && (
              <div className="text-left bg-destructive/5 rounded-lg p-3 text-sm space-y-2">
                {createApi.data.errors?.map((err, idx) => (
                  <p key={idx} className="text-destructive">
                    • {err.message}
                    {err.suggestion && <span className="block text-muted-foreground ml-3">{err.suggestion}</span>}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Actions: retry vs reset */}
          <div className="flex flex-col gap-3">
            <Button onClick={handleRetry} disabled={isLoading} variant="default" className="w-full" aria-label="Tentar novamente">
              <RotateCcw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>

            <Button onClick={handleResetFlow} disabled={isLoading} variant="outline" className="w-full bg-transparent" aria-label="Voltar ao início">
              Voltar ao início
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// Simple confetti effect
function ConfettiEffect({ reducedMotion }: { reducedMotion?: boolean }) {
  const pieces = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.2 + Math.random() * 1.4,
      rotate: Math.random() * 360,
      size: 6 + Math.random() * 8,
      color: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"][Math.floor(Math.random() * 6)],
    }))
  }, [])

  if (reducedMotion) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: -20, scale: 0 }}
          animate={{ opacity: [1, 1, 0], y: [0, 120 + Math.random() * 200], scale: [1, 1, 0.2], rotate: p.rotate }}
          transition={{ delay: p.delay, duration: p.duration, ease: "easeOut" }}
          className="absolute rounded-sm"
          style={{ left: `${p.left}%`, width: p.size, height: p.size, backgroundColor: p.color }}
        />
      ))}
    </div>
  )
}
