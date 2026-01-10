"use client"

import { ReactLenis } from "@studio-freight/react-lenis"
import type { ReactNode } from "react"

interface LenisProviderProps {
  children: ReactNode
}

export function LenisProvider({ children }: LenisProviderProps) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {/* @ts-expect-error - Incompatibilidade de versões de @types/react entre React 19 e react-lenis */}
      {children}
    </ReactLenis>
  )
}

export default LenisProvider
