"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, Palette, Rocket, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useOnboardingStore } from "@/lib/stores/onboarding-store"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"
import { useApiCall } from "@/lib/hooks/use-api-call"
import { validateIdentifier } from "@/lib/api-client"
import { Uploader } from "../primitives/uploader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const INTRO_CARDS = [
  {
    icon: Building2,
    title: "Sua empresa, sua cara",
    description: "Vamos configurar o visual e a estrutura do seu sistema de acordo com sua empresa.",
  },
  {
    icon: Palette,
    title: "Monte seu sistema",
    description: "Escolha módulos, cores e layouts. Tudo personalizado para seu fluxo de trabalho.",
  },
  {
    icon: Rocket,
    title: "Pronto em minutos",
    description: "Ao final, seu workspace estará configurado e pronto para usar.",
  },
]

export function IntroStep() {
  const reducedMotion = useReducedMotion()
  const [introPhase, setIntroPhase] = useState(0) // 0-2 = cards, 3 = form
  const [validationState, setValidationState] = useState<"idle" | "valid" | "invalid" | "optional">("idle")

  const {
    companyName,
    setCompanyName,
    companyLogo,
    setCompanyLogo,
    identifierType,
    setIdentifierType,
    identifierValue,
    setIdentifierValue,
    canProceed,
    nextStep,
    markStepComplete,
  } = useOnboardingStore()

  const [validationApi, executeValidation] = useApiCall(validateIdentifier)

  // Auto-advance intro cards
  useEffect(() => {
    if (introPhase < 3) {
      const timer = setTimeout(
        () => {
          setIntroPhase((p) => p + 1)
        },
        reducedMotion ? 500 : 2000,
      )
      return () => clearTimeout(timer)
    }
  }, [introPhase, reducedMotion])

  // Validate identifier on blur
  const handleIdentifierBlur = async () => {
    if (!identifierValue.trim()) {
      setValidationState("optional")
      return
    }

    const result = await executeValidation(identifierType, identifierValue)
    if (result) {
      setValidationState(result.status)
    }
  }

  const handleContinue = () => {
    if (canProceed(1)) {
      markStepComplete(1)
      nextStep()
    }
  }

  // Intro cards phase
  if (introPhase < 3) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={introPhase}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-md"
          >
            <motion.div
              initial={reducedMotion ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"
            >
              {(() => {
                const Icon = INTRO_CARDS[introPhase].icon
                return <Icon className="w-10 h-10 text-primary" />
              })()}
            </motion.div>

            <h2 className="text-2xl font-bold text-foreground mb-3">{INTRO_CARDS[introPhase].title}</h2>
            <p className="text-muted-foreground">{INTRO_CARDS[introPhase].description}</p>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-8">
              {INTRO_CARDS.map((_, idx) => (
                <motion.div
                  key={idx}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    idx === introPhase ? "bg-primary" : "bg-muted",
                  )}
                  animate={idx === introPhase && !reducedMotion ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <Button variant="ghost" size="sm" className="mt-8" onClick={() => setIntroPhase(3)}>
          Pular introdução
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    )
  }

  // Form phase
  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto p-6 space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Sobre sua empresa</h2>
        <p className="text-muted-foreground">Informações básicas para personalizar seu workspace</p>
      </div>

      <div className="flex justify-center">
        <Uploader value={companyLogo} onUpload={setCompanyLogo} onRemove={() => setCompanyLogo(null)} />
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="companyName">
            Nome da empresa <span className="text-destructive">*</span>
          </Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Tecnologia"
            className="mt-1.5"
          />
        </div>

        <div className="grid grid-cols-[100px_1fr] gap-3">
          <div>
            <Label>Tipo</Label>
            <Select value={identifierType} onValueChange={(v) => setIdentifierType(v as "CNPJ" | "CPF")}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CNPJ">CNPJ</SelectItem>
                <SelectItem value="CPF">CPF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="identifier">
              {identifierType} <span className="text-muted-foreground text-xs">(opcional)</span>
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="identifier"
                value={identifierValue}
                onChange={(e) => {
                  setIdentifierValue(e.target.value)
                  setValidationState("idle")
                }}
                onBlur={handleIdentifierBlur}
                placeholder={identifierType === "CNPJ" ? "00.000.000/0000-00" : "000.000.000-00"}
                className={cn(
                  validationState === "invalid" && "border-destructive",
                  validationState === "valid" && "border-green-500",
                )}
              />
              {validationApi.isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {validationState === "valid" && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
              {validationState === "invalid" && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
              )}
            </div>
            {validationState === "invalid" && validationApi.data?.errors && (
              <p className="text-xs text-destructive mt-1">{validationApi.data.errors[0]}</p>
            )}
          </div>
        </div>
      </div>

      <Button onClick={handleContinue} disabled={!canProceed(1)} className="w-full" size="lg">
        Continuar
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  )
}
