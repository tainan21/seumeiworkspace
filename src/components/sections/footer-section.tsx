"use client"

import Link from "next/link"
import { Github, Twitter, Linkedin } from "lucide-react"
import { useI18n, useScopedI18n } from "~/locales/client"
import LocaleToggler from "~/components/shared/locale-toggler"

export function FooterSection() {
  const t = useI18n()
  const tScoped = useScopedI18n("footer")
  
  // Acessa os links de forma segura
  const productLinksData = (t as any)("footer.sections.product.links") as Array<{ label: string; href: string }> | undefined
  const companyLinksData = (t as any)("footer.sections.company.links") as Array<{ label: string; href: string }> | undefined
  const legalLinksData = (t as any)("footer.sections.legal.links") as Array<{ label: string; href: string }> | undefined
  
  const footerLinks = {
    product: Array.isArray(productLinksData) ? productLinksData : [],
    company: Array.isArray(companyLinksData) ? companyLinksData : [],
    legal: Array.isArray(legalLinksData) ? legalLinksData : [],
  }
  return (
    <footer className="px-6 py-16 border-t border-zinc-900">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-display text-xl font-semibold text-zinc-100">
              {tScoped("brand")}
            </Link>
            <p className="mt-4 text-sm text-zinc-500 max-w-xs">
              {tScoped("tagline")}
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-zinc-100 mb-4">{tScoped("sections.product.title")}</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-zinc-100 mb-4">{tScoped("sections.company.title")}</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-zinc-100 mb-4">{tScoped("sections.legal.title")}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-600">{tScoped("copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-4">
            <LocaleToggler />
            <Link href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors" aria-label="GitHub">
              <Github className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
