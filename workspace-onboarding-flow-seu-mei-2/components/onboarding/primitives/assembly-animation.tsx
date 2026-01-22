"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, FolderKanban, FileText, Users, Settings, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"

const ICONS = [LayoutDashboard, FolderKanban, FileText, Users, BarChart3, Settings]

interface AssemblyAnimationProps {
  isPlaying: boolean
  onComplete: () => void
  variant?: "template" | "custom"
  colors?: { primary: string; accent: string }
}

export function AssemblyAnimation({
  isPlaying,
  onComplete,
  variant = "template",
  colors = { primary: "#3B82F6", accent: "#22D3EE" },
}: AssemblyAnimationProps) {
  const reducedMotion = useReducedMotion()
  const [phase, setPhase] = useState<"idle" | "blocks" | "connect" | "colorize" | "complete">("idle")

  useEffect(() => {
    if (!isPlaying) {
      setPhase("idle")
      return
    }

    if (reducedMotion) {
      setPhase("complete")
      const timer = setTimeout(onComplete, 500)
      return () => clearTimeout(timer)
    }

    // Sequência de fases
    const timers: NodeJS.Timeout[] = []

    timers.push(setTimeout(() => setPhase("blocks"), 100))
    timers.push(setTimeout(() => setPhase("connect"), 800))
    timers.push(setTimeout(() => setPhase("colorize"), 1400))
    timers.push(
      setTimeout(() => {
        setPhase("complete")
        onComplete()
      }, 2000),
    )

    return () => timers.forEach(clearTimeout)
  }, [isPlaying, reducedMotion, onComplete])

  if (!isPlaying && phase === "idle") return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-64 flex items-center justify-center overflow-hidden rounded-2xl bg-muted/30"
    >
      {/* Background grid */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Layout preview */}
      <div className="relative w-72 h-48 rounded-xl bg-background border shadow-lg overflow-hidden">
        {/* TopBar */}
        <motion.div
          initial={{ y: -40 }}
          animate={phase !== "idle" ? { y: 0 } : { y: -40 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="h-8 border-b flex items-center px-3 gap-2"
          style={{
            backgroundColor: phase === "colorize" || phase === "complete" ? colors.primary + "10" : undefined,
          }}
        >
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
          <div className="flex-1" />
          <motion.div
            initial={{ width: 0 }}
            animate={phase !== "idle" ? { width: 48 } : { width: 0 }}
            transition={{ delay: 0.3 }}
            className="h-4 rounded bg-muted"
          />
        </motion.div>

        <div className="flex h-[calc(100%-2rem)]">
          {/* Sidebar */}
          <motion.div
            initial={{ x: -60 }}
            animate={phase !== "idle" ? { x: 0 } : { x: -60 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
            className="w-12 border-r flex flex-col items-center py-2 gap-1"
            style={{
              backgroundColor: phase === "colorize" || phase === "complete" ? colors.primary + "05" : undefined,
            }}
          >
            {ICONS.slice(0, 5).map((Icon, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={
                  phase === "blocks" || phase === "connect" || phase === "colorize" || phase === "complete"
                    ? { scale: 1, opacity: 1 }
                    : { scale: 0, opacity: 0 }
                }
                transition={{ delay: 0.2 + i * 0.1 }}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  phase === "colorize" || phase === "complete" ? "bg-primary/10" : "bg-muted",
                )}
                style={{
                  backgroundColor:
                    (phase === "colorize" || phase === "complete") && i === 0 ? colors.primary + "20" : undefined,
                }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{
                    color: (phase === "colorize" || phase === "complete") && i === 0 ? colors.primary : undefined,
                  }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Content area */}
          <div className="flex-1 p-3 flex flex-col gap-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={phase !== "idle" ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ delay: 0.5 }}
              className="h-3 rounded w-24"
              style={{
                backgroundColor: phase === "colorize" || phase === "complete" ? colors.primary : "#e5e5e5",
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={phase !== "idle" ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ delay: 0.6 }}
              className="h-2 rounded w-32 bg-muted"
            />

            {/* Cards */}
            <div className="flex gap-2 mt-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={
                    phase === "connect" || phase === "colorize" || phase === "complete"
                      ? { opacity: 1, scale: 1, y: 0 }
                      : { opacity: 0, scale: 0.8, y: 20 }
                  }
                  transition={{ delay: 0.7 + i * 0.1, type: "spring" }}
                  className="flex-1 h-16 rounded-lg border bg-card"
                  style={{
                    borderColor: (phase === "colorize" || phase === "complete") && i === 0 ? colors.accent : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Connection lines */}
        <AnimatePresence>
          {phase === "connect" && (
            <motion.svg
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              <motion.line
                x1="48"
                y1="60"
                x2="100"
                y2="100"
                stroke={colors.accent}
                strokeWidth="2"
                strokeDasharray="4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>

      {/* Status text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 text-sm text-muted-foreground"
      >
        {phase === "blocks" && "Posicionando módulos..."}
        {phase === "connect" && "Conectando componentes..."}
        {phase === "colorize" && "Aplicando tema..."}
        {phase === "complete" && "Pronto!"}
      </motion.div>
    </motion.div>
  )
}
