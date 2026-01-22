/**
 * SEUMEI Landing Page
 * Marketing homepage for the platform
 */

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Logo } from "~/components/shared/logo";
import Pricing from "~/components/sectionsantigo/pricing";
import { BentoPricing } from "~/components/layout/bentoPrice";
import {
  ArrowRight,
  BarChart3,
  FileText,
  Shield,
  Wallet,
  Zap,
  Check,
  Landmark,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Faturamento Simples",
    description:
      "Crie orcamentos e faturas profissionais em segundos. Envie por email ou WhatsApp.",
  },
  {
    icon: Wallet,
    title: "Controle Financeiro",
    description:
      "Acompanhe receitas e despesas. Saiba exatamente quanto seu MEI esta lucrando.",
  },
  {
    icon: Zap,
    title: "PIX Integrado",
    description:
      "Gere QR Codes PIX automaticamente. Receba pagamentos instantaneamente.",
  },
  {
    icon: BarChart3,
    title: "Relatorios Inteligentes",
    description:
      "Dashboards e graficos que mostram a saude do seu negocio em tempo real.",
  },
  {
    icon: Shield,
    title: "Nota Fiscal Eletronica",
    description:
      "Emita NF-e e NFS-e diretamente do sistema. Tudo automatizado.",
  },
  {
    icon: Landmark,
    title: "Conta Digital SEUMEI",
    description:
      "Sua propria conta para receber pagamentos. Sem taxas escondidas.",
  },
];

const plans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "/mes",
    description: "Perfeito para comecar",
    features: [
      "Ate 50 clientes",
      "Ate 20 faturas/mes",
      "Modulo Financeiro basico",
      "Dashboard completo",
      "Suporte por email",
    ],
    cta: "Comecar Gratis",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "R$ 99,99",
    period: "/mes",
    description: "Para MEIs em crescimento",
    features: [
      "Clientes ilimitados",
      "Faturas ilimitadas",
      "NF-e e NFS-e incluidas",
      "PIX integrado",
      "Conta Digital SEUMEI",
      "Relatorios gerenciais",
      "API de integracao",
      "Suporte prioritario",
    ],
    cta: "Fazer Upgrade",
    highlighted: true,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo size="sm" />

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Recursos
            </Link>
            <Link
              href="#pricing"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Precos
            </Link>
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Entrar
            </Link>
            <Button asChild>
              <Link href="/register">Comecar Gratis</Link>
            </Button>
          </nav>

          <Button
            variant="outline"
            size="sm"
            className="bg-transparent md:hidden"
          >
            Menu
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="bg-muted mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                Mais de 10.000 MEIs ja usam
              </div>

              <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl lg:text-6xl">
                Gerencie seu MEI de forma simples e inteligente
              </h1>

              <p className="text-muted-foreground mt-6 text-lg text-balance">
                Faturamento, financeiro, notas fiscais e muito mais em uma unica
                plataforma. Feito por empreendedores, para empreendedores
                brasileiros.
              </p>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" asChild>
                  <Link href="/register">
                    Comecar Gratuitamente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">Ver Recursos</Link>
                </Button>
              </div>

              <p className="text-muted-foreground mt-4 text-sm">
                Sem cartao de credito. Cancele quando quiser.
              </p>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        </section>

        <Pricing />

        {/* Features Section */}
        <section id="features" className="border-t py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight">
                Tudo que seu MEI precisa em um so lugar
              </h2>
              <p className="text-muted-foreground mt-4">
                Ferramentas poderosas e simples de usar para voce focar no que
                importa: seu negocio.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-muted/50 border-0">
                  <CardContent className="p-6">
                    <div className="bg-background mb-4 inline-flex rounded-lg p-2.5">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground mt-2 text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="border-t py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight">
                Planos que cabem no seu bolso
              </h2>
              <p className="text-muted-foreground mt-4">
                Comece gratis e escale conforme seu negocio cresce.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-2">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={
                    plan.highlighted ? "border-foreground shadow-lg" : ""
                  }
                >
                  <CardContent className="p-6">
                    {plan.highlighted && (
                      <div className="bg-foreground text-background mb-4 inline-flex rounded-full px-3 py-1 text-xs font-medium">
                        Recomendado
                      </div>
                    )}
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {plan.description}
                    </p>

                    <div className="mt-4 flex items-baseline">
                      <span className="text-3xl font-semibold">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        {plan.period}
                      </span>
                    </div>

                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Check className="h-4 w-4 shrink-0 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="mt-6 w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                      asChild
                    >
                      <Link href="/register">{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight">
                Pronto para simplificar seu MEI?
              </h2>
              <p className="text-muted-foreground mt-4">
                Junte-se a milhares de empreendedores que ja transformaram a
                gestao do seu negocio.
              </p>
              <Button size="lg" className="mt-8" asChild>
                <Link href="/register">
                  Criar Conta Gratuita
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Bento Pricing Section */}
        <section className="border-t py-24">
          <div className="mx-auto max-w-6xl px-4">
            <BentoPricing />
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Logo size="sm" />
            <p className="text-muted-foreground text-sm">
              2024 SEUMEI. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Privacidade
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Termos
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// import FAQ from "~/components/sections/faq";
// import Features from "~/components/sections/features";
// import Hero from "~/components/sections/hero";
// import OpenSource from "~/components/sections/open-source";
// import Testimonials from "~/components/sections/testimonials";

// export default async function Home() {
//   return (
//     <>
//       <Hero />
//       <Features />
//       <Testimonials />
//
//       <FAQ />
//       <OpenSource />
//     </>
//   );
// }
