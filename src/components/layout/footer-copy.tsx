import Link from "next/link";
import { Suspense } from "react";
import { siteConfig } from "~/config/site";
import LocaleToggler from "../shared/locale-toggler";
import ThemeToggle from "../shared/theme-toggle";
import { Logo } from "~/components/seumei/logo";
import { Github, Twitter, Linkedin } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#" },
    { label: "Documentation", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const config = siteConfig();

  return (
    <footer className="relative z-10 w-full border-t border-zinc-900 bg-zinc-950 px-6 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <div className="col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Logo size="sm" />
            </Link>
            <p className="mt-4 text-sm text-zinc-500 max-w-xs leading-relaxed">
              {config.description || "A plataforma completa para MEIs organizarem e escalarem seus negócios com simplicidade."}
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-zinc-100 mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-zinc-500 hover:text-zinc-100 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-zinc-100 mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-zinc-500 hover:text-zinc-100 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-zinc-100 mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-zinc-500 hover:text-zinc-100 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-sm text-zinc-500">
              © {currentYear} {config.name}. All rights reserved.
            </p>
            <p className="text-xs text-zinc-600">
              Developed by{" "}
              <Link
                href={config.links.twitter}
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4 hover:text-zinc-400 transition-colors"
              >
                Matriz
              </Link>
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <Suspense>
                <LocaleToggler />
              </Suspense>
              <ThemeToggle />
            </div>
            
            <div className="h-4 w-px bg-zinc-800 hidden md:block" />

            <div className="flex items-center gap-4">
              <Link href={config.links.github} className="text-zinc-500 hover:text-zinc-100 transition-colors" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </Link>
              <Link href={config.links.twitter} className="text-zinc-500 hover:text-zinc-100 transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-zinc-500 hover:text-zinc-100 transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}