import type { Template } from "~/components/onboarding/primitives/template-card";

/**
 * Templates disponíveis no onboarding
 */
export const MOCK_TEMPLATES: Template[] = [
  {
    id: "startup-saas",
    name: "Startup SaaS",
    description: "Ideal para startups de tecnologia e SaaS",
    supportedFeatures: ["projects", "docs", "analytics", "roadmap", "integrations"],
    targetCompanyTypes: ["Startup", "Ltda"],
  },
  {
    id: "agency",
    name: "Agência Criativa",
    description: "Gestão de projetos e clientes",
    supportedFeatures: ["projects", "clients", "finances", "calendar", "docs"],
    targetCompanyTypes: ["Simples", "EIRELI", "Ltda"],
  },
  {
    id: "corporate",
    name: "Corporativo",
    description: "Estrutura completa para empresas",
    supportedFeatures: [
      "projects",
      "docs",
      "people",
      "finances",
      "reports",
      "analytics",
    ],
    targetCompanyTypes: ["Ltda", "SA"],
  },
  {
    id: "freelancer",
    name: "Freelancer",
    description: "Simples e direto ao ponto",
    supportedFeatures: ["projects", "clients", "finances", "calendar"],
    targetCompanyTypes: ["MEI"],
  },
];
