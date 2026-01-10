"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { LiquidCtaButton } from "~/components/buttons/liquid-cta-button"
import { useScopedI18n } from "~/locales/client"

export function CtaSection() {
  const t = useScopedI18n("cta")
  
  return (
    <section className="px-6 py-24">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-zinc-100 mb-6">{t("title")}</h2>
        <p className="text-lg text-zinc-500 mb-10 text-balance">
          {t("subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login">
            <LiquidCtaButton>{t("ctaPrimary")}</LiquidCtaButton>
          </Link>
          <Link
            href="#"
            className="group flex items-center gap-2 px-6 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <span>{t("ctaSecondary")}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  )
}
