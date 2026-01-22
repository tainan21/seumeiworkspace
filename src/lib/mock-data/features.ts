import type { Feature } from "~/components/onboarding/primitives/feature-selector";

/**
 * Features disponíveis no onboarding
 */
export const MOCK_FEATURES: Feature[] = [
  {
    id: "projects",
    name: "Projetos",
    description: "Kanban, listas e gestão de tarefas",
    icon: "FolderKanban",
    category: "CORE",
  },
  {
    id: "docs",
    name: "Documentos",
    description: "Wiki e base de conhecimento",
    icon: "FileText",
    category: "CORE",
  },
  {
    id: "people",
    name: "Pessoas",
    description: "RH e gestão de equipes",
    icon: "Users",
    category: "CORE",
  },
  {
    id: "finances",
    name: "Financeiro",
    description: "Contas, fluxo de caixa",
    icon: "DollarSign",
    category: "CORE",
  },
  {
    id: "clients",
    name: "Clientes",
    description: "CRM e relacionamento",
    icon: "Building2",
    category: "CORE",
  },
  {
    id: "calendar",
    name: "Agenda",
    description: "Eventos e compromissos",
    icon: "Calendar",
    category: "CORE",
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Dashboards e métricas",
    icon: "BarChart3",
    category: "AI",
  },
  {
    id: "reports",
    name: "Relatórios",
    description: "Relatórios customizados",
    icon: "FileBarChart",
    category: "CORE",
  },
  {
    id: "integrations",
    name: "Integrações",
    description: "Conecte apps externos",
    icon: "Puzzle",
    category: "INTEGRATION",
  },
  {
    id: "roadmap",
    name: "Roadmap",
    description: "Planejamento de produto",
    icon: "Map",
    category: "CORE",
  },
];
