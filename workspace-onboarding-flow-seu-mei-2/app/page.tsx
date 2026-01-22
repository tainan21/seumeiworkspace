"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if workspace exists
    const workspace = localStorage.getItem("seumei-workspace")
    if (workspace) {
      router.push("/dashboard")
    } else {
      router.push("/onboarding")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-muted-foreground">Carregando Seumei...</p>
      </motion.div>
    </div>
  )
}
