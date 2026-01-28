"use client"

import { cn } from "~/lib/utils"

type PatternVariant = "grid" | "dots" | "lines" | "mesh" | "gradient"

interface AnimatedBackgroundProps {
  variant?: PatternVariant
  className?: string
  animated?: boolean
}

export function AnimatedBackground({
  variant = "grid",
  className,
  animated = true,
}: AnimatedBackgroundProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 -z-10",
        className
      )}
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-zinc-950" />
      
      {/* Animated gradient orb */}
      {animated && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-1/2 -top-1/2 h-[800px] w-[800px] animate-pulse rounded-full bg-zinc-800/20 blur-3xl" />
          <div className="absolute -bottom-1/2 -right-1/2 h-[800px] w-[800px] animate-pulse rounded-full bg-zinc-800/20 blur-3xl [animation-delay:2s]" />
        </div>
      )}

      {/* Pattern overlay */}
      {variant === "grid" && (
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(255,255,255) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(255,255,255) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      )}

      {variant === "dots" && (
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, rgb(255,255,255) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      )}

      {variant === "lines" && (
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgb(255,255,255) 2px, rgb(255,255,255) 4px),
              repeating-linear-gradient(90deg, transparent, transparent 2px, rgb(255,255,255) 2px, rgb(255,255,255) 4px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      )}

      {variant === "mesh" && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgb(255,255,255) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(255,255,255) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(45deg, transparent 30%, rgb(255,255,255) 30%, rgb(255,255,255) 35%, transparent 35%, transparent 65%, rgb(255,255,255) 65%, rgb(255,255,255) 70%, transparent 70%),
                linear-gradient(-45deg, transparent 30%, rgb(255,255,255) 30%, rgb(255,255,255) 35%, transparent 35%, transparent 65%, rgb(255,255,255) 65%, rgb(255,255,255) 70%, transparent 70%)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>
      )}

      {variant === "gradient" && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 via-zinc-950 to-zinc-900/50" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgb(255,255,255) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(255,255,255) 1px, transparent 1px)
              `,
              backgroundSize: "30px 30px",
            }}
          />
        </div>
      )}

      {/* Shine effect */}
      {animated && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent [animation:shimmer_8s_ease-in-out_infinite] [background-size:200%_100%]" />
      )}
    </div>
  )
}