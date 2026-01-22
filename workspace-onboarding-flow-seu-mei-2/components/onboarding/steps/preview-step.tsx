"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, AlertTriangle, Check, ChevronDown, ChevronUp, Code2 } from "lucide-react"
import { useOnboardingStore } from "@/lib/stores/onboarding-store"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"
import { applyTemplateCompatibility } from "@/domains/template/template"
import { assembleMenu } from "@/domains/workspace/workspace"
import { getTemplateById } from "@/lib/mock-data/templates"
import { WorkspacePreview } from "../preview/workspace-preview"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { MenuItem } from "@/types/workspace"

export function PreviewStep() {
  const reducedMotion = useReducedMotion()
  const [isJsonExpanded, setIsJsonExpanded] = useState(false)

  const {
    companyName,
    companyLogo,
    identifierType,
    identifierValue,
    theme,
    selectedFeatures,
    companyType,
    selectedTemplate,
    menuComponents,
    topBarVariant,
    brandColors,
    compatibilityWarnings,
    setCompatibilityWarnings,
    userAcceptedWarnings,
    acceptWarnings,
    canProceed,
    nextStep,
    prevStep,
    markStepComplete,
  } = useOnboardingStore()

  // Check compatibility
  useEffect(() => {
    if (selectedTemplate && companyType) {
      const template = getTemplateById(selectedTemplate)
      if (template) {
        const result = applyTemplateCompatibility(template, selectedFeatures, companyType)
        setCompatibilityWarnings(result.warnings)
      }
    }
  }, [selectedTemplate, selectedFeatures, companyType, setCompatibilityWarnings])

  // Build menu items for preview
  const menuItems: MenuItem[] = useMemo(() => {
    return assembleMenu(menuComponents, selectedFeatures)
  }, [menuComponents, selectedFeatures])

  // Build preview JSON
  const previewJson = useMemo(() => {
    return {
      workspaceId: "ws_preview_xxx",
      slug: companyName.toLowerCase().replace(/\s+/g, "-"),
      name: companyName,
      brand: {
        logo: companyLogo ? "[base64 data]" : null,
        colors: brandColors,
      },
      company: {
        name: companyName,
        identifier: identifierValue ? { type: identifierType, value: identifierValue } : null,
      },
      apps: selectedFeatures,
      menuItems: menuItems.map(({ id, label, order }) => ({ id, label, order })),
      topBarVariant,
      theme,
      settings: {
        billingPlan: "free",
        locale: "pt-BR",
        timezone: "America/Sao_Paulo",
      },
    }
  }, [
    companyName,
    companyLogo,
    brandColors,
    identifierType,
    identifierValue,
    selectedFeatures,
    menuItems,
    topBarVariant,
    theme,
  ])

  const handleConfirm = () => {
    if (canProceed(7)) {
      markStepComplete(7)
      nextStep()
    }
  }

  const hasWarnings = compatibilityWarnings.length > 0
  const canConfirm = !hasWarnings || userAcceptedWarnings

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto p-6 space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Revisar e Confirmar</h2>
        <p className="text-muted-foreground">Confira como seu workspace ficará</p>
      </div>

      {/* Warnings */}
      <AnimatePresence>
        {hasWarnings && !userAcceptedWarnings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Atenção</h4>
                <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                  {compatibilityWarnings.map((warning, idx) => (
                    <li key={idx}>• {warning}</li>
                  ))}
                </ul>
                <Button size="sm" variant="outline" onClick={acceptWarnings} className="mt-3 bg-transparent">
                  <Check className="w-4 h-4 mr-1" />
                  Entendi, continuar assim
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview */}
      <WorkspacePreview
        menuItems={menuItems}
        topBarVariant={topBarVariant}
        theme={theme}
        colors={brandColors}
        companyName={companyName}
        logo={companyLogo}
        animated={true}
      />

      {/* JSON Preview */}
      <Collapsible open={isJsonExpanded} onOpenChange={setIsJsonExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between bg-transparent">
            <span className="flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Ver JSON do Workspace
            </span>
            {isJsonExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <motion.pre
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 p-4 rounded-xl bg-muted text-xs overflow-auto max-h-64 font-mono"
          >
            {JSON.stringify(previewJson, null, 2)}
          </motion.pre>
        </CollapsibleContent>
      </Collapsible>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="flex-1 bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={handleConfirm} disabled={!canConfirm} className="flex-1">
          Confirmar e Criar
        </Button>
      </div>
    </motion.div>
  )
}
