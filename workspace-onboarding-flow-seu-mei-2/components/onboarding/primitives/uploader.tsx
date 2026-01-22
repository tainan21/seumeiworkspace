"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"

type UploaderState = "idle" | "dragging" | "uploading" | "success" | "error"

interface UploaderProps {
  value: string | null
  onUpload: (dataUrl: string) => void
  onRemove: () => void
  accept?: string
  maxSizeMB?: number
  className?: string
}

export function Uploader({ value, onUpload, onRemove, accept = "image/*", maxSizeMB = 5, className }: UploaderProps) {
  const [state, setState] = useState<UploaderState>(value ? "success" : "idle")
  const [error, setError] = useState<string | null>(null)
  const reducedMotion = useReducedMotion()

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)

      // Validar tipo
      if (!file.type.startsWith("image/")) {
        setError("Apenas imagens são aceitas")
        setState("error")
        return
      }

      // Validar tamanho
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Tamanho máximo: ${maxSizeMB}MB`)
        setState("error")
        return
      }

      setState("uploading")

      // Simular upload e converter para base64
      await new Promise((r) => setTimeout(r, 1000))

      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        onUpload(dataUrl)
        setState("success")
      }
      reader.onerror = () => {
        setError("Erro ao processar imagem")
        setState("error")
      }
      reader.readAsDataURL(file)
    },
    [maxSizeMB, onUpload],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setState("idle")
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    onRemove()
    setState("idle")
    setError(null)
  }

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        {value && state === "success" ? (
          <motion.div
            key="preview"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative aspect-square w-32 rounded-xl overflow-hidden border-2 border-primary/20 bg-muted"
          >
            <img src={value || "/placeholder.svg"} alt="Logo preview" className="w-full h-full object-cover" />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ) : (
          <motion.label
            key="upload"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={(e) => {
              e.preventDefault()
              setState("dragging")
            }}
            onDragLeave={() => setState("idle")}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center justify-center gap-3",
              "aspect-square w-32 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
              state === "idle" && "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
              state === "dragging" && "border-primary bg-primary/5 scale-105",
              state === "uploading" && "border-muted-foreground/25 bg-muted/50 pointer-events-none",
              state === "error" && "border-destructive/50 bg-destructive/5",
            )}
          >
            <input
              type="file"
              accept={accept}
              onChange={handleChange}
              className="hidden"
              disabled={state === "uploading"}
            />

            {state === "uploading" ? (
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            ) : state === "error" ? (
              <ImageIcon className="w-6 h-6 text-destructive" />
            ) : (
              <Upload
                className={cn(
                  "w-6 h-6 transition-colors",
                  state === "dragging" ? "text-primary" : "text-muted-foreground",
                )}
              />
            )}

            <span
              className={cn(
                "text-xs text-center px-2",
                state === "error" ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {state === "uploading"
                ? "Enviando..."
                : state === "error"
                  ? error
                  : state === "dragging"
                    ? "Solte aqui"
                    : "Logo da empresa"}
            </span>
          </motion.label>
        )}
      </AnimatePresence>
    </div>
  )
}
